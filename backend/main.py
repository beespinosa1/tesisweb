from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
from gender_bias_analyzer import analyzer

app = FastAPI(
    title="Analizador de Sesgo de Género",
    description="API para analizar sesgo de género en ofertas laborales usando análisis lexical y modelo RoBERTa",
    version="2.0.0"
)

# CORS: permitir acceso desde tu frontend desplegado
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tesisweb-akz5.vercel.app",
        "https://tesisweb-akz5-md0p6c0uw-barbaras-projects-c40cbbb4.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para la request
class AnalysisRequest(BaseModel):
    description: str

# Modelo para la response
class AnalysisResponse(BaseModel):
    lexical_score: float
    contextual_score: float
    final_prediction: float
    method_used: str
    confidence: float
    masculine_hits: int
    feminine_hits: int
    detected_terms: Dict[str, List[str]]
    roberta_probabilities: Dict[str, float]
    is_tic: bool

@app.get("/")
async def root():
    return {
        "message": "Analizador de Sesgo de Género API v2.0",
        "version": "2.0.0",
        "features": [
            "Análisis lexical con lexicon personalizado",
            "Análisis contextual con modelo RoBERTa",
            "Ensemble de ambos métodos",
            "Detección de términos específicos"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "analyzer_loaded": analyzer is not None}

@app.get("/api/lexicon/stats")
async def get_lexicon_stats():
    return {
        "masculine_terms_count": len(analyzer.masc_terms),
        "feminine_terms_count": len(analyzer.fem_terms),
        "neutral_terms_count": len(analyzer.neutral_terms),
        "total_terms": len(analyzer.masc_terms) + len(analyzer.fem_terms) + len(analyzer.neutral_terms)
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_gender_bias(request: AnalysisRequest):
    try:
        if not request.description.strip():
            raise HTTPException(status_code=400, detail="La descripción no puede estar vacía")

        results = analyzer.analyze(request.description)

        return AnalysisResponse(
            lexical_score=results["lexical_score"],
            contextual_score=results["contextual_score"],
            final_prediction=results["final_prediction"],
            method_used=results["method_used"],
            confidence=results["confidence"],
            masculine_hits=results["masculine_hits"],
            feminine_hits=results["feminine_hits"],
            detected_terms=results["detected_terms"],
            roberta_probabilities=results["roberta_probabilities"],
            is_tic=results["is_tic"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el análisis: {str(e)}")

@app.get("/api/analyzer/info")
async def get_analyzer_info():
    return {
        "model_version": "v2.0_ensemble",
        "features": {
            "lexical_analysis": True,
            "contextual_analysis": analyzer.classifier is not None,
            "ensemble_method": analyzer.classifier is not None,
            "spacy_model": "es_core_news_md",
            "roberta_model": "PlanTL-GOB-ES/roberta-base-bne" if analyzer.classifier else None
        },
        "lexicon_info": {
            "masculine_terms": len(analyzer.masc_terms),
            "feminine_terms": len(analyzer.fem_terms),
            "neutral_terms": len(analyzer.neutral_terms)
        }
    }
