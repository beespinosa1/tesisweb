#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import re
import unicodedata
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

# Procesamiento de texto
from unidecode import unidecode
import spacy
from nltk.corpus import stopwords

# Modelos de transformers
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline
)
import torch

# Configuración de logging
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class BiasResult:
    """Resultado del análisis de sesgo para una oferta de trabajo."""
    masc_hits: int
    fem_hits: int
    lex_score: float
    prob_M: float
    prob_F: float
    class_pred: str
    model_ver: str
    evaluated_at: datetime
    detected_terms: Dict[str, List[str]]  # Términos detectados por categoría

class AdvancedBiasAnalyzer:
    """
    Analizador avanzado de sesgo de género que combina:
    1. Análisis léxico tradicional
    2. Modelo RoBERTa fine-tuned para clasificación de género
    3. Ensemble de ambos métodos
    """
    
    def __init__(self, lexicon_path: str = "lexicon_definitivo.csv"):
        """
        Inicializa el analizador con léxico.
        
        Args:
            lexicon_path: Ruta al archivo CSV del léxico
        """
        self.lexicon_path = lexicon_path
        
        # Cargar léxico
        self._load_lexicon()
        
        # Cargar modelo spaCy
        logger.info("Cargando modelo spaCy...")
        try:
            self.nlp = spacy.load("es_core_news_md", disable=["ner", "parser"])
        except OSError:
            logger.warning("Modelo spaCy no encontrado. Instalando...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "es_core_news_md"])
            self.nlp = spacy.load("es_core_news_md", disable=["ner", "parser"])
        
        # Cargar stop words
        try:
            self.stop_es = {self._normalize(w) for w in stopwords.words("spanish")}
        except LookupError:
            logger.warning("Stop words no encontradas. Descargando...")
            import nltk
            nltk.download('stopwords')
            self.stop_es = {self._normalize(w) for w in stopwords.words("spanish")}
        
        # Cargar modelo RoBERTa
        self._load_roberta_model()
        
        logger.info("Analizador inicializado correctamente")
    
    def _load_lexicon(self):
        """Carga y prepara el léxico de términos de género."""
        logger.info("Cargando lexico...")
        
        lex = (
            pd.read_csv(self.lexicon_path, encoding="utf-8-sig", keep_default_na=False)
              .rename(columns=lambda c: c.strip().lower())
        )
        
        lex["categoria"] = (
            lex["categoria"]
               .str.replace("\ufeff", "", regex=False)
               .str.strip().str.lower()
        )
        
        self.masc_terms, self.fem_terms, self.neutral_terms = set(), set(), set()
        for _, r in lex.iterrows():
            base = self._normalize(r["termino_base"])
            variants = [self._normalize(v) for v in re.split(r"[;,|\t]", r["variantes"]) if v]
            
            if r["categoria"] == "masculino":
                self.masc_terms.update([base, *variants])
            elif r["categoria"] == "femenino":
                self.fem_terms.update([base, *variants])
            elif r["categoria"] == "neutral":
                self.neutral_terms.update([base, *variants])
        
        logger.info(f"Lexico cargado: {len(self.masc_terms)} terminos masculinos, "
                   f"{len(self.fem_terms)} femeninos, {len(self.neutral_terms)} neutrales")
    
    def _load_roberta_model(self):
        """Carga el modelo RoBERTa para clasificación de género."""
        logger.info("Cargando modelo RoBERTa...")
        
        # Usar un modelo RoBERTa multilingüe fine-tuned para clasificación de género
        model_name = "PlanTL-GOB-ES/roberta-base-bne"  # Modelo español de RoBERTa
        
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name, 
                num_labels=2  # Masculino/Femenino
            )
            
            # Crear pipeline para clasificación
            self.classifier = pipeline(
                "text-classification",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("Modelo RoBERTa cargado correctamente")
            
        except Exception as e:
            logger.warning(f"No se pudo cargar el modelo RoBERTa: {e}")
            logger.info("Usando solo analisis lexico")
            self.classifier = None
    
    def _normalize(self, txt: str) -> str:
        """Normaliza texto: minúsculas, sin tildes ni espacios sobrantes."""
        return unidecode(txt.lower().strip())
    
    def _lemmatize(self, texto: str) -> List[str]:
        """Devuelve lista de lemas normalizados de un texto en español."""
        texto = self._normalize(re.sub(r"https?://\S+", " ", texto))
        texto = re.sub(r"[^a-zñ ]+", " ", texto)
        doc = self.nlp(texto)
        
        return [
            self._normalize(tok.lemma_)
            for tok in doc
            if tok.is_alpha and self._normalize(tok.text) not in self.stop_es
        ]
    
    def _lexical_analysis(self, description: str) -> Tuple[int, int, float, Dict[str, List[str]]]:
        """
        Realiza análisis léxico tradicional.
        
        Returns:
            Tuple con (hits_masculinos, hits_femeninos, bias_score, términos_detectados)
        """
        lemmas = set(self._lemmatize(description))
        
        # Detectar términos específicos
        detected_masc = list(lemmas & self.masc_terms)
        detected_fem = list(lemmas & self.fem_terms)
        detected_neutral = list(lemmas & self.neutral_terms)
        
        masc_hits = len(detected_masc)
        fem_hits = len(detected_fem)
        
        total = masc_hits + fem_hits
        bias_score = masc_hits / total if total > 0 else 0.5
        
        detected_terms = {
            "masculino": detected_masc,
            "femenino": detected_fem,
            "neutral": detected_neutral
        }
        
        return masc_hits, fem_hits, bias_score, detected_terms
    
    def _roberta_analysis(self, description: str) -> Tuple[float, float, str]:
        """
        Realiza análisis usando modelo RoBERTa.
        
        Returns:
            Tuple con (prob_masculino, prob_femenino, prediccion)
        """
        if self.classifier is None:
            return 0.5, 0.5, 'N'  
        
        try:
            # Preparar texto para el modelo
            clean_text = re.sub(r'https?://\S+', '', description)
            clean_text = re.sub(r'[^\w\s]', ' ', clean_text)
            clean_text = clean_text[:512]  # Limitar longitud
            
            # Clasificar
            result = self.classifier(clean_text)[0]
            
            # Interpretar resultados (ajustar según el modelo específico)
            if result['label'] == 'LABEL_0':  # Masculino
                prob_M = result['score']
                prob_F = 1 - result['score']
                pred = 'M'
            else:  # Femenino
                prob_F = result['score']
                prob_M = 1 - result['score']
                pred = 'F'
            
            return prob_M, prob_F, pred
            
        except Exception as e:
            logger.error(f"Error en analisis RoBERTa: {e}")
            return 0.5, 0.5, 'N'
    
    def analyze(self, text: str) -> Dict:
        """
        Analiza el sesgo de género en el texto proporcionado
        
        Args:
            text (str): Descripción de la oferta laboral
            
        Returns:
            Dict: Resultados del análisis con scores y predicción final
        """
        # Análisis léxico
        masc_hits, fem_hits, lex_score, detected_terms = self._lexical_analysis(text)
        
        # Análisis RoBERTa
        prob_M, prob_F, roberta_pred = self._roberta_analysis(text)
        
        # Decisión final (ensemble simple)
        if self.classifier is not None:
            # Combinar ambos métodos
            ensemble_score = 0.4 * lex_score + 0.6 * (prob_M / (prob_M + prob_F))
            class_pred = 'M' if ensemble_score > 0.5 else 'F'
            method_used = "ensemble"
            confidence = max(lex_score, prob_M / (prob_M + prob_F))
        else:
            # Solo léxico
            class_pred = 'M' if lex_score > 0.5 else 'F'
            method_used = "lexical"
            confidence = lex_score
        
        # Calcular score contextual basado en RoBERTa
        contextual_score = prob_M / (prob_M + prob_F) if (prob_M + prob_F) > 0 else 0.5
        
        return {
            "lexical_score": round(lex_score, 4),
            "contextual_score": round(contextual_score, 4),
            "final_prediction": round(ensemble_score if self.classifier is not None else lex_score, 4),
            "method_used": method_used,
            "confidence": round(confidence, 4),
            "masculine_hits": masc_hits,
            "feminine_hits": fem_hits,
            "detected_terms": detected_terms,
            "roberta_probabilities": {
                "masculine": round(prob_M, 4),
                "feminine": round(prob_F, 4)
            }
        }

# Inicializar el analizador global
analyzer = AdvancedBiasAnalyzer()

# Función de utilidad para testing
def test_analyzer():
    """
    Función para probar el analizador
    """
    # Ejemplos de texto para probar
    test_cases = [
        "Buscamos un desarrollador agresivo y competitivo que sea líder del equipo",
        "Necesitamos una profesional colaborativa y empática para trabajar en equipo",
        "Se requiere un analista técnico con experiencia en desarrollo de software"
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Texto: {text}")
        results = analyzer.analyze(text)
        print(f"Lexical Score: {results['lexical_score']:.3f}")
        print(f"Contextual Score: {results['contextual_score']:.3f}")
        print(f"Final Prediction: {results['final_prediction']:.3f}")
        print(f"Method Used: {results['method_used']}")
        print(f"Detected Terms: {results['detected_terms']}")

if __name__ == "__main__":
    test_analyzer() 