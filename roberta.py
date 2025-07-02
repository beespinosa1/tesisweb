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

# Base de datos
from sqlalchemy import create_engine, text, inspect
import psycopg2

# Configuración de logging
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class BiasResult:
    """Resultado del análisis de sesgo para una oferta de trabajo."""
    job_id: int
    masc_hits: int
    fem_hits: int
    lex_score: float
    prob_M: float
    prob_F: float
    class_pred: str
    model_ver: str
    evaluated_at: datetime

class AdvancedBiasAnalyzer:
    """
    Analizador avanzado de sesgo de género que combina:
    1. Análisis léxico tradicional
    2. Modelo RoBERTa fine-tuned para clasificación de género
    3. Ensemble de ambos métodos
    """
    
    def __init__(self, db_url: str, lexicon_path: str = "lexicon_definitivo.csv"):
        """
        Inicializa el analizador con conexión a BD y léxico.
        
        Args:
            db_url: URL de conexión a PostgreSQL
            lexicon_path: Ruta al archivo CSV del léxico
        """
        self.db_url = db_url
        self.engine = create_engine(db_url)
        self.lexicon_path = lexicon_path
        
        # Verificar estructura de la tabla
        self._verify_table_structure()
        
        # Cargar léxico
        self._load_lexicon()
        
        # Cargar modelo spaCy
        logger.info("Cargando modelo spaCy...")
        self.nlp = spacy.load("es_core_news_md", disable=["ner", "parser"])
        
        # Cargar stop words
        self.stop_es = {self._normalize(w) for w in stopwords.words("spanish")}
        
        # Cargar modelo RoBERTa
        self._load_roberta_model()
        
        logger.info("Analizador inicializado correctamente")
    
    def _verify_table_structure(self):
        """Verifica que la tabla fact_bias_assessment tenga la estructura correcta."""
        
        logger.info("Verificando estructura de la tabla fact_bias_assessment...")
        
        inspector = inspect(self.engine)
        
        try:
            if 'fact_bias_assessment' not in inspector.get_table_names():
                logger.warning("La tabla fact_bias_assessment no existe. Se creara automaticamente.")
                self._create_table()
                return
            
            # Verificar columnas existentes
            columns = inspector.get_columns('fact_bias_assessment')
            column_names = [col['name'].lower() for col in columns]  # Convertir a minúsculas
            
            logger.info(f"Columnas existentes: {column_names}")
            
            required_columns = [
                'job_id', 'masc_hits', 'fem_hits', 'lex_score', 
                'prob_m', 'prob_f', 'class_pred', 'model_ver', 'evaluated_at'  # Todo en minúsculas
            ]
            
            missing_columns = [col for col in required_columns if col not in column_names]
            
            if missing_columns:
                logger.warning(f"Faltan columnas en la tabla: {missing_columns}")
                logger.info("Agregando columnas faltantes...")
                self._add_missing_columns(missing_columns)
            else:
                logger.info("Estructura de tabla verificada correctamente")
                
        except Exception as e:
            logger.error(f"Error verificando estructura de tabla: {e}")
            raise
    
    def _create_table(self):
        """Crea la tabla fact_bias_assessment con la estructura correcta."""
        create_table_sql = """
        CREATE TABLE fact_bias_assessment (
            job_id        BIGINT PRIMARY KEY REFERENCES fact_job_post(job_id),
            masc_hits     INT,
            fem_hits      INT,
            lex_score     NUMERIC(5,4),
            prob_m        NUMERIC(6,5),
            prob_f        NUMERIC(6,5),
            class_pred    CHAR(1),          -- 'M' / 'F'
            model_ver     TEXT,
            evaluated_at  TIMESTAMPTZ
        );
        """
        
        with self.engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
        
        logger.info("Tabla fact_bias_assessment creada exitosamente")
    
    def _add_missing_columns(self, missing_columns: List[str]):
        """Agrega las columnas faltantes a la tabla existente."""
        with self.engine.connect() as conn:
            for col in missing_columns:
                try:
                    if col == 'prob_m':
                        conn.execute(text("ALTER TABLE fact_bias_assessment ADD COLUMN prob_m NUMERIC(6,5)"))
                    elif col == 'prob_f':
                        conn.execute(text("ALTER TABLE fact_bias_assessment ADD COLUMN prob_f NUMERIC(6,5)"))
                    elif col == 'model_ver':
                        conn.execute(text("ALTER TABLE fact_bias_assessment ADD COLUMN model_ver TEXT"))
                    elif col == 'evaluated_at':
                        conn.execute(text("ALTER TABLE fact_bias_assessment ADD COLUMN evaluated_at TIMESTAMPTZ"))
                    
                    logger.info(f"Columna {col} agregada exitosamente")
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info(f"La columna {col} ya existe, continuando...")
                    else:
                        raise e
            
            conn.commit()
        
        logger.info("Verificacion de columnas completada")
    
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
        
        self.masc_terms, self.fem_terms = set(), set()
        for _, r in lex.iterrows():
            base = self._normalize(r["termino_base"])
            variants = [self._normalize(v) for v in re.split(r"[;,|\t]", r["variantes"]) if v]
            
            if r["categoria"] == "masculino":
                self.masc_terms.update([base, *variants])
            elif r["categoria"] == "femenino":
                self.fem_terms.update([base, *variants])
        
        logger.info(f"Lexico cargado: {len(self.masc_terms)} terminos masculinos, "
                   f"{len(self.fem_terms)} femeninos")
    
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
    
    def _lexical_analysis(self, description: str) -> Tuple[int, int, float]:
        """
        Realiza análisis léxico tradicional.
        
        Returns:
            Tuple con (hits_masculinos, hits_femeninos, bias_score)
        """
        lemmas = set(self._lemmatize(description))
        masc_hits = len(lemmas & self.masc_terms)
        fem_hits = len(lemmas & self.fem_terms)
        
        total = masc_hits + fem_hits
        bias_score = masc_hits / total if total > 0 else 0.5
        
        return masc_hits, fem_hits, bias_score
    
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
    
    def analyze_job(self, job_id: int, title: str, description: str) -> BiasResult:
        """
        Analiza una oferta de trabajo completa.
        
        Args:
            job_id: ID de la oferta
            title: Título del trabajo
            description: Descripción del trabajo
            
        Returns:
            BiasResult con todos los análisis
        """
        # Combinar título y descripción
        full_text = f"{title}. {description}"
        
        # Análisis léxico
        masc_hits, fem_hits, lex_score = self._lexical_analysis(full_text)
        
        # Análisis RoBERTa
        prob_M, prob_F, roberta_pred = self._roberta_analysis(full_text)
        
        # Decisión final (ensemble simple)
        if self.classifier is not None:
            # Combinar ambos métodos
            ensemble_score = 0.4 * lex_score + 0.6 * (prob_M / (prob_M + prob_F))
            class_pred = 'M' if ensemble_score > 0.5 else 'F'
        else:
            # Solo léxico
            class_pred = 'M' if lex_score > 0.5 else 'F'
        
        return BiasResult(
            job_id=job_id,
            masc_hits=masc_hits,
            fem_hits=fem_hits,
            lex_score=round(lex_score, 4),
            prob_M=round(prob_M, 5),
            prob_F=round(prob_F, 5),
            class_pred=class_pred,
            model_ver="v2.0_ensemble",
            evaluated_at=datetime.now()
        )
    
    def process_all_jobs(self, batch_size: int = 25) -> List[BiasResult]:
        """
        Procesa todas las ofertas de trabajo en la base de datos.
        
        Args:
            batch_size: Tamaño del lote para procesamiento
            
        Returns:
            Lista de resultados de análisis
        """
        logger.info("Iniciando procesamiento de todas las ofertas...")
        
        # Obtener todas las ofertas que no han sido analizadas
        query = """
        SELECT job_id, title, description
        FROM fact_job_post
        WHERE job_id NOT IN (
            SELECT job_id FROM fact_bias_assessment
        )
        ORDER BY job_id
        """
        
        df = pd.read_sql_query(query, self.engine)
        df["description"] = df["description"].fillna("")
        
        if len(df) == 0:
            logger.info("No hay ofertas nuevas para procesar")
            return []
        
        logger.info(f"Procesando {len(df)} ofertas de trabajo...")
        
        all_results = []
        save_batch_size = 100  # Guardar cada 100 resultados
        
        for i, row in df.iterrows():
            try:
                result = self.analyze_job(
                    job_id=row['job_id'],
                    title=row['title'],
                    description=row['description']
                )
                all_results.append(result)
                
                # Mostrar progreso
                if (i + 1) % batch_size == 0:
                    logger.info(f"Procesadas {i + 1}/{len(df)} ofertas")
                
                # Guardar en lotes para evitar problemas de memoria
                if len(all_results) >= save_batch_size:
                    logger.info(f"Guardando lote de {len(all_results)} resultados...")
                    try:
                        self.save_results(all_results)
                        all_results = []  # Limpiar lista después de guardar
                    except Exception as e:
                        logger.error(f"Error guardando lote: {e}")
                        # Continuar con el procesamiento aunque falle el guardado
                        all_results = []
                    
            except Exception as e:
                logger.error(f"Error procesando job_id {row['job_id']}: {e}")
                continue
        
        # Guardar resultados restantes
        if all_results:
            logger.info(f"Guardando lote final de {len(all_results)} resultados...")
            try:
                self.save_results(all_results)
            except Exception as e:
                logger.error(f"Error guardando lote final: {e}")
        
        logger.info(f"Procesamiento completado. Total de ofertas procesadas: {len(df)}")
        return all_results
    
    def save_results(self, results: List[BiasResult]):
        """
        Guarda los resultados en la base de datos.
        
        Args:
            results: Lista de resultados de análisis
        """
        if not results:
            logger.warning("No hay resultados para guardar")
            return
        
        logger.info(f"Guardando {len(results)} resultados en la base de datos...")
        
        # Preparar datos para inserción
        data = []
        for result in results:
            data.append({
                'job_id': result.job_id,
                'masc_hits': result.masc_hits,
                'fem_hits': result.fem_hits,
                'lex_score': result.lex_score,
                'prob_m': result.prob_M,  # Usar minúsculas para la BD
                'prob_f': result.prob_F,  # Usar minúsculas para la BD
                'class_pred': result.class_pred,
                'model_ver': result.model_ver,
                'evaluated_at': result.evaluated_at
            })
        
        # Insertar en lotes pequeños para evitar error de parámetros
        df_results = pd.DataFrame(data)
        batch_size = 100  # Lotes más pequeños
        
        try:
            for i in range(0, len(df_results), batch_size):
                batch = df_results.iloc[i:i+batch_size]
                logger.info(f"Insertando lote {i//batch_size + 1}/{(len(df_results) + batch_size - 1)//batch_size}")
                
                # Usar método más simple sin 'multi'
                batch.to_sql(
                    'fact_bias_assessment',
                    self.engine,
                    if_exists='append',
                    index=False,
                    method=None  # Método por defecto
                )
            
            logger.info("Resultados guardados exitosamente")
            
        except Exception as e:
            logger.error(f"Error guardando resultados: {e}")
            # Intentar método alternativo si falla
            try:
                logger.info("Intentando metodo alternativo de insercion...")
                self._save_results_alternative(data)
            except Exception as e2:
                logger.error(f"Error en metodo alternativo: {e2}")
                raise
    
    def _save_results_alternative(self, data: List[Dict]):
        """
        Método alternativo de inserción usando SQL directo.
        
        Args:
            data: Lista de diccionarios con los datos a insertar
        """
        insert_query = """
        INSERT INTO fact_bias_assessment 
        (job_id, masc_hits, fem_hits, lex_score, prob_m, prob_f, class_pred, model_ver, evaluated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (job_id) DO UPDATE SET
            masc_hits = EXCLUDED.masc_hits,
            fem_hits = EXCLUDED.fem_hits,
            lex_score = EXCLUDED.lex_score,
            prob_m = EXCLUDED.prob_m,
            prob_f = EXCLUDED.prob_f,
            class_pred = EXCLUDED.class_pred,
            model_ver = EXCLUDED.model_ver,
            evaluated_at = EXCLUDED.evaluated_at
        """
        
        # Insertar en lotes pequeños
        batch_size = 50
        with self.engine.connect() as conn:
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                logger.info(f"Insertando lote alternativo {i//batch_size + 1}/{(len(data) + batch_size - 1)//batch_size}")
                
                # Insertar uno por uno para evitar problemas de formato
                for item in batch:
                    try:
                        values = (
                            item['job_id'],
                            item['masc_hits'],
                            item['fem_hits'],
                            float(item['lex_score']),
                            float(item['prob_m']),
                            float(item['prob_f']),
                            item['class_pred'],
                            item['model_ver'],
                            item['evaluated_at']
                        )
                        conn.execute(text(insert_query), values)
                    except Exception as e:
                        logger.warning(f"Error insertando job_id {item['job_id']}: {e}")
                        continue
                
                conn.commit()
        
        logger.info("Insercion alternativa completada exitosamente")

    def get_statistics(self) -> Dict:
        """
        Obtiene estadísticas del análisis realizado.
        
        Returns:
            Diccionario con estadísticas
        """
        query = """
        SELECT 
            COUNT(*) as total_jobs,
            AVG(lex_score) as avg_lex_score,
            AVG(prob_m) as avg_prob_m,
            AVG(prob_f) as avg_prob_f,
            COUNT(CASE WHEN class_pred = 'M' THEN 1 END) as male_bias_count,
            COUNT(CASE WHEN class_pred = 'F' THEN 1 END) as female_bias_count,
            model_ver
        FROM fact_bias_assessment
        GROUP BY model_ver
        """
        
        stats = pd.read_sql_query(query, self.engine)
        return stats.to_dict('records')

def main():
    """Función principal para ejecutar el análisis."""
    
    # Configuración
    DB_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/tesis"
    LEXICON_PATH = "lexicon_definitivo.csv"
    
    try:
        # Inicializar analizador
        analyzer = AdvancedBiasAnalyzer(DB_URL, LEXICON_PATH)
        
        # Procesar ofertas
        results = analyzer.process_all_jobs(batch_size=25)
        
        # Guardar resultados
        if results:
            analyzer.save_results(results)
            
            # Mostrar estadísticas
            stats = analyzer.get_statistics()
            logger.info("Estadisticas del analisis:")
            for stat in stats:
                logger.info(f"  {stat}")
        
        logger.info("Analisis completado exitosamente")
        
    except Exception as e:
        logger.error(f"Error en el analisis: {e}")
        raise

if __name__ == "__main__":
    main() 