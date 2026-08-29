require("dotenv").config();

const express = require("express");
const multer = require("multer");
const Anthropic = require("@anthropic-ai/sdk");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// ACADEMIC AI — SERVER.JS
// UZUN BELGE MODU
// KRİTİK BÖLÜM KORUMASI V3
// ÜÇLÜ KANIT MODU
// YAPILANDIRILMIŞ ÇIKTI
// ÜCRETSİZ PDF DEBUG MODU
// KAYNAK TABANLI AI ASİSTAN
// =====================================================

// =====================================================
// AYARLAR
// =====================================================

// =====================================================
// EKONOMİK UZUN BELGE MODU V4
// Uzun PDF'lerde tüm parçaları AI'a göndermek yerine
// en önemli 3 belge bölgesi analiz edilir.
// =====================================================

const ECONOMY_MODE = true;
const ECONOMY_MAX_ANALYSIS_CHUNKS = 3;

const DEFAULT_CHUNK_SIZE = 34000;
const MIN_CHUNK_SIZE = 30000;
const MAX_CHUNK_SIZE = 42000;

const CHUNK_OVERLAP = 1500;
const MAX_CHUNKS = ECONOMY_MAX_ANALYSIS_CHUNKS;

// Yalnızca geçici API sorunlarında bir kez yeniden dene.
const API_RETRIES = 1;

const PRIORITY_CONTEXT_RADIUS = 5500;
const MAX_PRIORITY_EXCERPTS = 6;

const DEBUG_PREVIEW_LENGTH = 1800;

// AI Asistan
const ASSISTANT_MAX_SOURCES = 20;
const ASSISTANT_MAX_SOURCE_CHARS = 18000;

// =====================================================
// PDF YÜKLEME
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 30 * 1024 * 1024
  }
});

// =====================================================
// AI BAĞLANTISI
// =====================================================

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "❌ ANTHROPIC_API_KEY bulunamadı."
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// =====================================================
// EXPRESS
// =====================================================

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.static(__dirname)
);

// =====================================================
// GENEL YARDIMCILAR
// =====================================================

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function safeString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

// =====================================================
// API HATA YÖNETİMİ
// =====================================================

function getApiErrorText(error) {
  return [
    error?.message,
    error?.error?.message,
    error?.error?.error?.message
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

function isCreditBalanceError(error) {
  const message =
    getApiErrorText(error);

  return (
    message.includes(
      "credit balance is too low"
    ) ||
    message.includes(
      "purchase credits"
    ) ||
    message.includes(
      "plans & billing"
    ) ||
    message.includes(
      "insufficient credit"
    )
  );
}

function shouldRetryApiError(error) {
  const status =
    Number(error?.status || 0);

  if (
    isCreditBalanceError(error)
  ) {
    return false;
  }

  if (
    [400, 401, 403, 404, 422]
      .includes(status)
  ) {
    return false;
  }

  if (
    [
      408,
      409,
      429,
      500,
      502,
      503,
      504,
      529
    ].includes(status)
  ) {
    return true;
  }

  const message =
    getApiErrorText(error);

  return (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("overloaded")
  );
}

function getPublicApiError(
  error,
  area = "analysis"
) {
  if (
    isCreditBalanceError(error)
  ) {
    if (
      area === "assistant"
    ) {
      return "AI Asistan kullanılamıyor çünkü Anthropic API kredisi yetersiz. Kredi ekledikten sonra tekrar deneyebilirsin.";
    }

    return "PDF analizi tamamlanamadı çünkü Anthropic API kredisi yetersiz. Kredi ekledikten sonra tekrar deneyebilirsin.";
  }

  if (
    error?.status === 401 ||
    error?.status === 403
  ) {
    return "Academic AI bağlantısı doğrulanamadı. API anahtarını kontrol et.";
  }

  if (
    error?.status === 429 ||
    error?.status === 529
  ) {
    return "Academic AI şu anda yoğun. Bir süre sonra tekrar deneyin.";
  }

  if (
    area === "assistant"
  ) {
    return "AI Asistan şu anda yanıt oluşturamadı.";
  }

  return "Analiz sırasında beklenmeyen bir sorun oluştu.";
}

function safeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string"
    )
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function normalizeForComparison(value) {
  return safeString(value)
    .toLocaleLowerCase("tr-TR")
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values) {
  const seen = new Set();
  const output = [];

  safeStringArray(values).forEach(
    (value) => {
      const normalized =
        normalizeForComparison(value);

      if (
        !normalized ||
        seen.has(normalized)
      ) {
        return;
      }

      seen.add(normalized);
      output.push(value);
    }
  );

  return output;
}

// =====================================================
// KANIT NORMALİZASYONU
// =====================================================

function normalizeEvidenceItem(item) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return {
      text: "",
      evidence: "",
      evidenceType: "fact",
      sourceSection: ""
    };
  }

  const allowedTypes = [
    "explicit",
    "fact",
    "inference"
  ];

  return {
    text:
      safeString(item.text),

    evidence:
      safeString(item.evidence),

    evidenceType:
      allowedTypes.includes(
        item.evidenceType
      )
        ? item.evidenceType
        : "fact",

    sourceSection:
      safeString(
        item.sourceSection
      )
  };
}

function normalizeEvidenceArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeEvidenceItem)
    .filter(
      (item) =>
        item.text
    );
}

function uniqueEvidenceItems(items) {
  const normalized =
    normalizeEvidenceArray(items);

  const seen = new Set();
  const output = [];

  for (const item of normalized) {
    const textKey =
      normalizeForComparison(
        item.text
      );

    const evidenceKey =
      normalizeForComparison(
        item.evidence
      );

    const key =
      `${textKey}|${evidenceKey}`;

    if (
      !textKey ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

// =====================================================
// ANALİZ NORMALİZASYONU
// =====================================================

function normalizeAnalysis(
  data,
  fileName
) {
  const findingEvidence =
    uniqueEvidenceItems(
      data?.findingEvidence
    );

  const conclusionEvidence =
    uniqueEvidenceItems(
      data?.conclusionEvidence
    );

  const limitationEvidence =
    uniqueEvidenceItems(
      data?.limitationEvidence
    );

  const recommendationEvidence =
    uniqueEvidenceItems(
      data?.recommendationEvidence
    );

  let findings =
    uniqueStrings(
      data?.findings
    );

  let conclusions =
    uniqueStrings(
      data?.conclusions
    );

  let recommendations =
    uniqueStrings(
      data?.recommendations
    );

  // =====================================================
  // BULGU KURTARMA
  // =====================================================

  if (
    !findings.length &&
    findingEvidence.length
  ) {
    findings =
      uniqueStrings(
        findingEvidence
          .map(
            (item) =>
              safeString(
                item.text
              )
          )
          .filter(Boolean)
      );
  }

  // =====================================================
  // SONUÇ KURTARMA
  // =====================================================

  if (
    !conclusions.length &&
    conclusionEvidence.length
  ) {
    conclusions =
      uniqueStrings(
        conclusionEvidence
          .map(
            (item) =>
              safeString(
                item.text
              )
          )
          .filter(Boolean)
      );
  }

  // =====================================================
  // ÖNERİ KURTARMA
  // =====================================================

  if (
    !recommendations.length &&
    recommendationEvidence.length
  ) {
    recommendations =
      uniqueStrings(
        recommendationEvidence
          .map(
            (item) =>
              safeString(
                item.text
              )
          )
          .filter(Boolean)
      );
  }

  return {
    title:
      safeString(
        data?.title
      ) ||
      fileName.replace(
        /\.pdf$/i,
        ""
      ),

    purpose:
      safeString(
        data?.purpose
      ),

    researchProblem:
      safeString(
        data?.researchProblem
      ),

    method:
      safeString(
        data?.method
      ),

    researchDesign:
      safeString(
        data?.researchDesign
      ),

    population:
      safeString(
        data?.population
      ),

    sample:
      safeString(
        data?.sample
      ),

    dataCollection:
      safeString(
        data?.dataCollection
      ),

    dataAnalysis:
      safeString(
        data?.dataAnalysis
      ),

    summary:
      safeString(
        data?.summary
      ),

    findings,

    conclusions,

    recommendations,

    keywords:
      uniqueStrings(
        data?.keywords
      ).slice(
        0,
        15
      ),

    contribution:
      safeString(
        data?.contribution
      ),

    findingEvidence,

    conclusionEvidence,

    limitationEvidence,

    recommendationEvidence
  };
}
// =====================================================
// ANALİZ ŞEMASI
// =====================================================

const evidenceItemSchema = {
  type: "object",

  properties: {
    text: {
      type: "string"
    },

    evidence: {
      type: "string"
    },

    evidenceType: {
      type: "string",
      enum: [
        "explicit",
        "fact",
        "inference"
      ]
    },

    sourceSection: {
      type: "string"
    }
  },

  required: [
    "text",
    "evidence",
    "evidenceType",
    "sourceSection"
  ],

  additionalProperties: false
};

const academicAnalysisSchema = {
  type: "object",

  properties: {
    title: {
      type: "string"
    },

    purpose: {
      type: "string"
    },

    researchProblem: {
      type: "string"
    },

    method: {
      type: "string"
    },

    researchDesign: {
      type: "string"
    },

    population: {
      type: "string"
    },

    sample: {
      type: "string"
    },

    dataCollection: {
      type: "string"
    },

    dataAnalysis: {
      type: "string"
    },

    summary: {
      type: "string"
    },

    findings: {
      type: "array",
      items: {
        type: "string"
      }
    },

    conclusions: {
      type: "array",
      items: {
        type: "string"
      }
    },

    recommendations: {
      type: "array",
      items: {
        type: "string"
      }
    },

    keywords: {
      type: "array",
      items: {
        type: "string"
      }
    },

    contribution: {
      type: "string"
    },

    findingEvidence: {
      type: "array",
      items:
        evidenceItemSchema
    },

    conclusionEvidence: {
      type: "array",
      items:
        evidenceItemSchema
    },

    limitationEvidence: {
      type: "array",
      items:
        evidenceItemSchema
    },

    recommendationEvidence: {
      type: "array",
      items:
        evidenceItemSchema
    }
  },

  required: [
    "title",
    "purpose",
    "researchProblem",
    "method",
    "researchDesign",
    "population",
    "sample",
    "dataCollection",
    "dataAnalysis",
    "summary",
    "findings",
    "conclusions",
    "recommendations",
    "keywords",
    "contribution",
    "findingEvidence",
    "conclusionEvidence",
    "limitationEvidence",
    "recommendationEvidence"
  ],

  additionalProperties: false
};

const analysisTool = {
  name:
    "record_academic_analysis",

  description:
    "Academic AI akademik belge analizini kaydeder. " +
    "Yalnızca belge tarafından desteklenen bilgiler kullanılmalıdır. " +
    "Araştırmacının açık ifadeleri, belgesel gerçekler ve AI çıkarımları ayrılmalıdır.",

  input_schema:
    academicAnalysisSchema
};

// =====================================================
// DİNAMİK PARÇA BOYUTU
// =====================================================

function calculateChunkSize(
  textLength
) {
  if (
    textLength <=
    DEFAULT_CHUNK_SIZE
  ) {
    return DEFAULT_CHUNK_SIZE;
  }

  const desired =
    Math.ceil(
      textLength /
      MAX_CHUNKS
    ) +
    CHUNK_OVERLAP;

  return Math.max(
    MIN_CHUNK_SIZE,
    Math.min(
      desired,
      MAX_CHUNK_SIZE
    )
  );
}

// =====================================================
// METNİ PARÇALARA BÖL
// =====================================================

function splitTextIntoChunks(text) {
  if (!text) {
    return [];
  }

  const chunkSize =
    calculateChunkSize(
      text.length
    );

  if (
    text.length <=
    chunkSize
  ) {
    return [
      {
        text,
        start: 0,
        end: text.length,
        index: 0
      }
    ];
  }

  const chunks = [];
  let start = 0;

  while (
    start <
    text.length
  ) {
    let end =
      Math.min(
        start +
          chunkSize,
        text.length
      );

    if (
      end <
      text.length
    ) {
      const minimumBreak =
        Math.max(
          start +
            Math.floor(
              chunkSize *
                0.65
            ),
          end - 8000
        );

      const paragraphBreak =
        text.lastIndexOf(
          "\n\n",
          end
        );

      const lineBreak =
        text.lastIndexOf(
          "\n",
          end
        );

      if (
        paragraphBreak >
        minimumBreak
      ) {
        end =
          paragraphBreak;
      } else if (
        lineBreak >
        minimumBreak
      ) {
        end =
          lineBreak;
      }
    }

    const chunkText =
      text
        .slice(
          start,
          end
        )
        .trim();

    if (chunkText) {
      chunks.push({
        text: chunkText,
        start,
        end,
        index:
          chunks.length
      });
    }

    if (
      end >=
      text.length
    ) {
      break;
    }

    start =
      Math.max(
        end -
          CHUNK_OVERLAP,
        start + 1
      );
  }

  return chunks;
}

// =====================================================
// UZUN BELGE SEÇİMİ
// =====================================================

function selectChunksForAnalysis(
  chunks
) {
  if (!chunks.length) {
    return {
      selected: [],
      sampled: false,
      omittedCount: 0
    };
  }

  if (
    chunks.length <=
    ECONOMY_MAX_ANALYSIS_CHUNKS
  ) {
    return {
      selected: chunks,
      sampled: false,
      omittedCount: 0
    };
  }

  /*
    Ekonomik seçim:

    1. İlk parça:
       başlık, amaç, problem ve yöntem
       bilgisini yakalamak için.

    2. Orta parça:
       ana gövdedeki bulguların bir
       bölümünü temsil etmek için.

    3. Son parça:
       bulgular, sonuç, öneriler ve
       sınırlılıkları yakalamak için.

    Kritik bölümler ayrıca aşağıdaki
    priorityExcerpts sistemiyle senteze
    doğrudan gönderildiği için tamamen
    kaybolmaz.
  */

  const selectedIndexes =
    new Set([
      0,
      Math.floor(
        chunks.length / 2
      ),
      chunks.length - 1
    ]);

  const selected =
    [...selectedIndexes]
      .sort(
        (a, b) =>
          a - b
      )
      .map(
        (index) =>
          chunks[index]
      );

  return {
    selected,
    sampled: true,
    omittedCount:
      chunks.length -
      selected.length
  };
}

// =====================================================
// KAYNAKÇA BÖLGESİNİ BUL
// =====================================================

function findReferencesStart(text) {
  const lines =
    text.split("\n");

  let offset = 0;
  const candidates = [];

  const patterns = [
    /^kaynakça$/i,
    /^kaynaklar$/i,
    /^references$/i,
    /^bibliography$/i
  ];

  for (
    const line of lines
  ) {
    const trimmed =
      line.trim();

    if (
      patterns.some(
        (pattern) =>
          pattern.test(trimmed)
      )
    ) {
      candidates.push(
        offset
      );
    }

    offset +=
      line.length + 1;
  }

  if (!candidates.length) {
    return -1;
  }

  const lowerHalf =
    candidates.filter(
      (index) =>
        index >
        text.length * 0.55
    );

  if (lowerHalf.length) {
    return lowerHalf[0];
  }

  return candidates[
    candidates.length - 1
  ];
}

// =====================================================
// GERÇEK BÖLÜM BAŞLIKLARI
// =====================================================

const sectionHeadingGroups = [
  {
    label: "Araştırmanın Sınırlılıkları",

    headings: [
      "araştırmanın sınırlılıkları",
      "araştırmanın sınırlılıkları ve öneriler",
      "çalışmanın sınırlılıkları",
      "çalışmanın sınırlılıkları ve öneriler",
      "araştırmanın kısıtları",
      "çalışmanın kısıtları",
      "sınırlılıklar",
      "kısıtlılıklar",
      "limitations",
      "limitations of the study",
      "study limitations",
      "research limitations"
    ]
  },

  {
    label: "Sonuç ve Öneriler",

    headings: [
      "sonuç ve öneriler",
      "sonuçlar ve öneriler",
      "sonuç ve öneri",
      "sonuç",
      "sonuçlar",
      "araştırmanın sonuçları",
      "genel sonuç",
      "genel sonuçlar",
      "sonuç ve tartışma",
      "conclusion",
      "conclusions",
      "conclusion and recommendations",
      "conclusions and recommendations",
      "conclusion and discussion",
      "discussion and conclusion"
    ]
  },

  {
    label: "Öneriler",

    headings: [
      "öneriler",
      "araştırmacılara öneriler",
      "araştırmacılar için öneriler",
      "gelecek araştırmalara öneriler",
      "gelecek araştırmalar için öneriler",
      "gelecek çalışmalar için öneriler",
      "ileride yapılacak araştırmalara öneriler",
      "recommendations",
      "recommendations for future research",
      "future research",
      "future studies",
      "future directions",
      "implications for future research"
    ]
  },

  {
    label: "Bulgular",

    headings: [
      "bulgular",
      "araştırma bulguları",
      "araştırmanın bulguları",
      "bulgular ve yorum",
      "bulgular ve yorumlar",
      "bulgular ve tartışma",
      "araştırma bulguları ve tartışma",
      "findings",
      "results",
      "findings and discussion",
      "results and discussion"
    ]
  },

  {
    label: "Tartışma",

    headings: [
      "tartışma",
      "tartışma ve sonuç",
      "tartışma ve sonuçlar",
      "discussion",
      "discussion and conclusion",
      "discussion and conclusions"
    ]
  },

  {
    label: "Yöntem",

    headings: [
      "yöntem",
      "araştırmanın yöntemi",
      "araştırma yöntemi",
      "metodoloji",
      "method",
      "methods",
      "methodology",
      "materials and methods"
    ]
  },

  {
    label: "Evren ve Örneklem",

    headings: [
      "evren ve örneklem",
      "evren ve örneklem grubu",
      "çalışma grubu",
      "araştırma grubu",
      "katılımcılar",
      "örneklem",
      "araştırmanın örneklemi",
      "participants",
      "sample",
      "study sample"
    ]
  }
];
// =====================================================
// BİR SATIR BAŞLIK MI?
// =====================================================

function normalizeHeadingLine(line) {
  return line
    .trim()
    .toLocaleLowerCase(
      "tr-TR"
    )
    .replace(
      /^\d+(\.\d+)*[\s.)-]*/,
      ""
    )
    .replace(
      /^[ivxlcdm]+[\s.)-]+/i,
      ""
    )
    .replace(
      /[:.;,-]+$/,
      ""
    )
    .trim();
}

// =====================================================
// BAŞLIKLARI BUL
// =====================================================

function findSectionHeadings(
  text,
  referencesStart
) {
  const lines =
    text.split("\n");

  let offset = 0;
  const results = [];

  for (
    const line of lines
  ) {
    const normalized =
      normalizeHeadingLine(
        line
      );

    if (
      normalized &&
      normalized.length <= 90
    ) {
      for (
        const group of
        sectionHeadingGroups
      ) {
        const found =
          group.headings.find(
            (heading) =>
              normalized ===
              heading.toLocaleLowerCase(
                "tr-TR"
              )
          );

        if (found) {
          const inReferences =
            referencesStart >= 0 &&
            offset >=
              referencesStart;

          if (
            !inReferences
          ) {
            results.push({
              label:
                group.label,

              heading:
                line.trim(),

              matchedTerm:
                found,

              index:
                offset,

              confidence:
                "high"
            });
          }
        }
      }
    }

    offset +=
      line.length + 1;
  }

  return results;
}

// =====================================================
// AÇIK SINIRLILIK CÜMLESİ ADAYLARI
// =====================================================

function findExplicitLimitationSentences(
  text,
  referencesStart
) {
  const searchEnd =
    referencesStart >= 0
      ? referencesStart
      : text.length;

  const body =
    text.slice(
      0,
      searchEnd
    );

  const sentenceRegex =
    /[^.!?\n]*(?:sınırlıdır|sınırlı tutulmuştur|sınırlandırılmıştır|sınırlılık(?:ları|ların|lara|lardan)?|kısıtlıdır|kısıtlanmıştır|this study is limited to|the study is limited to|limitations of this study|limitations of the study)[^.!?\n]*[.!?]?/giu;

  const results = [];
  let match;

  while (
    (
      match =
        sentenceRegex.exec(
          body
        )
    ) !== null
  ) {
    const sentence =
      match[0]
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    if (
      sentence.length < 20 ||
      sentence.length > 700
    ) {
      continue;
    }

    const normalized =
      normalizeForComparison(
        sentence
      );

    const studyStructureTerms = [
      "bu araştırma",
      "araştırma",
      "araştırmanın",
      "bu çalışma",
      "çalışma",
      "çalışmanın",
      "bu tez",
      "tez",
      "tezin",
      "örneklem",
      "örneklemin",
      "çalışma grubu",
      "katılımcı",
      "katılımcılar",
      "katılımcıların",
      "evren",
      "araştırma evreni",
      "kapsam",
      "araştırmanın kapsamı",
      "veri",
      "veriler",
      "veri toplama",
      "görüşme",
      "görüşmeler",
      "anket",
      "zaman",
      "dönem",
      "coğrafi",
      "ülke",
      "kurum",
      "this study",
      "the study",
      "this research",
      "sample",
      "participants",
      "data collection"
    ];

    const hasStudyStructureTerm =
      studyStructureTerms.some(
        (term) =>
          normalized.includes(
            term
          )
      );

    const strongStudyLimitationPatterns = [
      /bu araştırma .{0,160} sınırlıdır/u,
      /araştırma .{0,160} ile sınırlıdır/u,
      /bu çalışma .{0,160} sınırlıdır/u,
      /çalışma .{0,160} ile sınırlıdır/u,
      /bu tez .{0,160} sınırlıdır/u,
      /tez .{0,160} ile sınırlıdır/u,

      /araştırma .{0,160} sınırlandırılmıştır/u,
      /çalışma .{0,160} sınırlandırılmıştır/u,
      /tez .{0,160} sınırlandırılmıştır/u,

      /araştırmanın sınırlılık/u,
      /çalışmanın sınırlılık/u,
      /tezin sınırlılık/u,

      /örneklem .{0,160} sınırlıdır/u,
      /çalışma grubu .{0,160} sınırlıdır/u,
      /katılımcı.{0,160} ile sınırlıdır/u,
      /kapsam .{0,160} sınırlıdır/u,
      /veri .{0,160} ile sınırlıdır/u,

      /this study is limited to/u,
      /the study is limited to/u,
      /limitations of this study/u,
      /limitations of the study/u
    ];

    const hasStrongStudyPattern =
      strongStudyLimitationPatterns.some(
        (pattern) =>
          pattern.test(
            normalized
          )
      );

    const falsePositivePatterns = [
      /katkısı .{0,60} sınırlıdır/u,
      /katkısı sınırlıdır/u,

      /etkisi .{0,60} sınırlıdır/u,
      /etkisi sınırlıdır/u,

      /kullanımı .{0,60} sınırlıdır/u,
      /kullanım .{0,60} sınırlıdır/u,

      /rolü .{0,60} sınırlıdır/u,
      /rol .{0,60} sınırlıdır/u,

      /kapasitesi .{0,60} sınırlıdır/u,
      /kapasite .{0,60} sınırlıdır/u,

      /erişimi .{0,60} sınırlıdır/u,
      /erişim .{0,60} sınırlıdır/u,

      /olanakları .{0,60} sınırlıdır/u,
      /imkanı .{0,60} sınırlıdır/u,
      /imkânı .{0,60} sınırlıdır/u,

      /yetenekleri .{0,60} sınırlıdır/u,
      /yetenek .{0,60} sınırlıdır/u,

      /özelliği .{0,60} sınırlıdır/u,
      /işlevi .{0,60} sınırlıdır/u,

      /bu araçlara .{0,80} sınırlıdır/u,
      /araçların .{0,80} sınırlıdır/u
    ];

    const looksLikeFalsePositive =
      falsePositivePatterns.some(
        (pattern) =>
          pattern.test(
            normalized
          )
      );

    if (
      looksLikeFalsePositive &&
      !hasStrongStudyPattern
    ) {
      continue;
    }

    const hasLimitationLanguage =
      normalized.includes(
        "sınırlılık"
      ) ||
      normalized.includes(
        "sınırlıdır"
      ) ||
      normalized.includes(
        "sınırlandırılmıştır"
      ) ||
      normalized.includes(
        "kısıtlıdır"
      ) ||
      normalized.includes(
        "kısıtlanmıştır"
      ) ||
      normalized.includes(
        "this study is limited"
      ) ||
      normalized.includes(
        "limitations of this study"
      ) ||
      normalized.includes(
        "limitations of the study"
      );

    if (
      !hasLimitationLanguage
    ) {
      continue;
    }

    if (
      !hasStrongStudyPattern &&
      !hasStudyStructureTerm
    ) {
      continue;
    }

    results.push({
      text:
        sentence,

      index:
        match.index,

      confidence:
        hasStrongStudyPattern
          ? "high"
          : "medium"
    });
  }

  const seen =
    new Set();

  return results.filter(
    (item) => {
      const key =
        normalizeForComparison(
          item.text
        );

      if (
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);
      return true;
    }
  );
}
// =====================================================
// KRİTİK BÖLGE ÜRET
// =====================================================

function extractPriorityExcerpts(
  text
) {
  const referencesStart =
    findReferencesStart(text);

  const headings =
    findSectionHeadings(
      text,
      referencesStart
    );

  const explicitLimitations =
    findExplicitLimitationSentences(
      text,
      referencesStart
    );

  const candidates = [];

  headings.forEach(
    (heading) => {
      let priority = 6;

      if (
        heading.label ===
        "Araştırmanın Sınırlılıkları"
      ) {
        priority = 1;
      } else if (
        heading.label ===
        "Bulgular"
      ) {
        priority = 2;
      } else if (
        heading.label ===
        "Sonuç ve Öneriler"
      ) {
        priority = 3;
      } else if (
        heading.label ===
        "Öneriler"
      ) {
        priority = 4;
      } else if (
        heading.label ===
        "Tartışma"
      ) {
        priority = 5;
      }

      candidates.push({
        label:
          heading.label,

        matchedTerm:
          heading.matchedTerm,

        index:
          heading.index,

        priority,

        detectionType:
          "heading"
      });
    }
  );

  explicitLimitations.forEach(
    (item) => {
      candidates.push({
        label:
          "Araştırmanın Sınırlılıkları",

        matchedTerm:
          "Açık sınırlılık cümlesi",

        index:
          item.index,

        priority: 1,

        detectionType:
          "explicitSentence"
      });
    }
  );

  const preferredLabels = [
    "Araştırmanın Sınırlılıkları",
    "Bulgular",
    "Sonuç ve Öneriler",
    "Öneriler"
  ];

  const preferredCandidates = [];
  const remainingCandidates = [];

  for (
    const label of
    preferredLabels
  ) {
    const matches =
      candidates
        .filter(
          (candidate) =>
            candidate.label ===
            label
        )
        .sort(
          (a, b) =>
            b.index -
            a.index
        );

    if (matches.length) {
      preferredCandidates.push(
        matches[0]
      );
    }
  }

  const preferredKeys =
    new Set(
      preferredCandidates.map(
        (item) =>
          `${item.label}|${item.index}|${item.detectionType}`
      )
    );

  candidates
    .filter(
      (candidate) =>
        !preferredKeys.has(
          `${candidate.label}|${candidate.index}|${candidate.detectionType}`
        )
    )
    .sort(
      (a, b) => {
        if (
          a.priority !==
          b.priority
        ) {
          return (
            a.priority -
            b.priority
          );
        }

        return (
          b.index -
          a.index
        );
      }
    )
    .forEach(
      (candidate) => {
        remainingCandidates.push(
          candidate
        );
      }
    );

  const orderedCandidates = [
    ...preferredCandidates,
    ...remainingCandidates
  ];

  const ranges = [];
  const excerpts = [];

  for (
    const candidate of
    orderedCandidates
  ) {
    if (
      excerpts.length >=
      MAX_PRIORITY_EXCERPTS
    ) {
      break;
    }

    const start =
      Math.max(
        0,
        candidate.index -
          PRIORITY_CONTEXT_RADIUS
      );

    const end =
      Math.min(
        referencesStart >= 0
          ? referencesStart
          : text.length,

        candidate.index +
          PRIORITY_CONTEXT_RADIUS
      );

    if (
      end <= start
    ) {
      continue;
    }

    const overlaps =
      ranges.some(
        (range) => {
          const overlapStart =
            Math.max(
              range.start,
              start
            );

          const overlapEnd =
            Math.min(
              range.end,
              end
            );

          const overlap =
            Math.max(
              0,
              overlapEnd -
                overlapStart
            );

          const smaller =
            Math.min(
              range.end -
                range.start,
              end - start
            );

          return (
            smaller > 0 &&
            overlap /
              smaller >
              0.78
          );
        }
      );

    if (overlaps) {
      continue;
    }

    ranges.push({
      start,
      end
    });

    excerpts.push({
      label:
        candidate.label,

      matchedTerm:
        candidate.matchedTerm,

      detectionType:
        candidate.detectionType,

      start,
      end,

      text:
        text
          .slice(
            start,
            end
          )
          .trim()
    });
  }

  return {
    excerpts,
    headings,
    explicitLimitations,
    referencesStart
  };
}

// =====================================================
// KRİTİK METNİ PROMPT İÇİN FORMATLA
// =====================================================

function formatPriorityExcerpts(
  excerpts
) {
  if (
    !Array.isArray(
      excerpts
    ) ||
    !excerpts.length
  ) {
    return (
      "Kritik bölüm başlığı otomatik olarak bulunamadı."
    );
  }

  return excerpts
    .map(
      (
        excerpt,
        index
      ) => `
=====================================================
KRİTİK HAM METİN ${index + 1}
OLASI BÖLÜM: ${excerpt.label}
TESPİT TÜRÜ: ${excerpt.detectionType}
EŞLEŞEN İFADE: ${excerpt.matchedTerm}
=====================================================

${excerpt.text}
`
    )
    .join("\n");
}

// =====================================================
// DEBUG ÖNİZLEME
// =====================================================

function shortenDebugText(
  text,
  max =
    DEBUG_PREVIEW_LENGTH
) {
  const value =
    String(text || "")
      .trim();

  if (
    value.length <= max
  ) {
    return value;
  }

  return (
    value.slice(
      0,
      max
    ) +
    "\n...[DEBUG ÖNİZLEMESİ KISALTILDI]..."
  );
}

// =====================================================
// KAPSAMA ORANI
// =====================================================

function calculateCoverage(
  selectedChunks,
  textLength
) {
  if (
    !selectedChunks.length ||
    !textLength
  ) {
    return 0;
  }

  const ranges =
    selectedChunks
      .map(
        (chunk) => ({
          start:
            chunk.start,

          end:
            chunk.end
        })
      )
      .sort(
        (a, b) =>
          a.start -
          b.start
      );

  let total = 0;

  let currentStart =
    ranges[0].start;

  let currentEnd =
    ranges[0].end;

  for (
    let i = 1;
    i <
    ranges.length;
    i++
  ) {
    const range =
      ranges[i];

    if (
      range.start <=
      currentEnd
    ) {
      currentEnd =
        Math.max(
          currentEnd,
          range.end
        );
    } else {
      total +=
        currentEnd -
        currentStart;

      currentStart =
        range.start;

      currentEnd =
        range.end;
    }
  }

  total +=
    currentEnd -
    currentStart;

  return Math.min(
    100,
    Number(
      (
        (
          total /
          textLength
        ) *
        100
      ).toFixed(1)
    )
  );
}

// =====================================================
// ÜCRETSİZ PDF DEBUG
// =====================================================

app.post(
  "/api/debug-pdf",
  upload.single("pdf"),
  async (req, res) => {
    let parser = null;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "PDF dosyası gönderilmedi."
          });
      }

      console.log("");
      console.log(
        "========================================="
      );

      console.log(
        "🆓 ACADEMIC AI — ÜCRETSİZ PDF TESTİ V3"
      );

      console.log(
        "========================================="
      );

      console.log(
        "💰 Anthropic API çağrısı yapılmaz."
      );

      parser =
        new pdfParse.PDFParse({
          data:
            req.file.buffer
        });

      const pdfResult =
        await parser.getText();

      const pdfText =
        normalizeWhitespace(
          pdfResult.text ||
            ""
        );

      if (!pdfText) {
        return res
          .status(400)
          .json({
            success: false,
            freeTest: true,
            anthropicCalls: 0,
            message:
              "PDF içinden okunabilir metin çıkarılamadı."
          });
      }

      const allChunks =
        splitTextIntoChunks(
          pdfText
        );

      const selection =
        selectChunksForAnalysis(
          allChunks
        );

      const coverage =
        calculateCoverage(
          selection.selected,
          pdfText.length
        );

      const priority =
        extractPriorityExcerpts(
          pdfText
        );

      const limitationHeadings =
        priority.headings.filter(
          (item) =>
            item.label ===
            "Araştırmanın Sınırlılıkları"
        );

      console.log("");
      console.log(
        "📄 Dosya:",
        req.file.originalname
      );

      console.log(
        "📝 Karakter:",
        pdfText.length
      );

      console.log(
        "📚 Toplam parça:",
        allChunks.length
      );

      console.log(
        "✅ Kapsama:",
        coverage + "%"
      );

      console.log("");
      console.log(
        "📚 Kaynakça:",
        priority.referencesStart >= 0
          ? "BULUNDU"
          : "BULUNAMADI"
      );

      console.log(
        "🎯 Akademik başlık:",
        priority.headings.length
      );

      console.log(
        "🟢 Sınırlılık başlığı:",
        limitationHeadings.length
      );

      console.log(
        "🔎 Açık sınırlılık cümlesi:",
        priority
          .explicitLimitations
          .length
      );

      console.log(
        "💰 Anthropic API çağrısı: 0"
      );

      console.log("");

      return res.json({
        success: true,

        freeTest: true,

        anthropicCalls: 0,

        fileName:
          req.file.originalname,

        extractedCharacters:
          pdfText.length,

        totalChunks:
          allChunks.length,

        selectedChunks:
          selection.selected.length,

        omittedChunks:
          selection.omittedCount,

        coveragePercent:
          coverage,

        referencesStart:
          priority.referencesStart,

        referencesDetected:
          priority.referencesStart >=
          0,

        detectedHeadings:
          priority.headings,

        limitationHeadingCount:
          limitationHeadings.length,

        explicitLimitationSentenceCount:
          priority
            .explicitLimitations
            .length,

        explicitLimitationSentences:
          priority
            .explicitLimitations,

        criticalExcerptCount:
          priority.excerpts.length,

        limitationDetected:
          limitationHeadings.length >
            0 ||
          priority
            .explicitLimitations
            .length >
            0,

        excerpts:
          priority.excerpts.map(
            (item) => ({
              label:
                item.label,

              matchedTerm:
                item.matchedTerm,

              detectionType:
                item.detectionType,

              start:
                item.start,

              end:
                item.end,

              preview:
                shortenDebugText(
                  item.text,
                  700
                )
            })
          )
      });
    } catch (error) {
      console.error(
        "❌ Ücretsiz PDF test hatası:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          freeTest: true,

          anthropicCalls: 0,

          message:
            "PDF ücretsiz test sırasında okunamadı."
        });
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch {
          // uygulamayı durdurma
        }
      }
    }
  }
);

// =====================================================
// YAPILANDIRILMIŞ AI ÇAĞRISI
// =====================================================

async function askForStructuredAnalysis(
  prompt,
  options = {}
) {
  const maxTokens =
    options.maxTokens ||
    8000;

  let lastError = null;

  for (
    let attempt = 0;
    attempt <=
    API_RETRIES;
    attempt++
  ) {
    try {
      if (
        attempt > 0
      ) {
        console.log(
          `↻ AI yeniden deneniyor (${attempt}/${API_RETRIES})...`
        );

        await sleep(
          1200 *
            attempt
        );
      }

      const message =
  await anthropic.messages.create({
    model:
      "claude-sonnet-5",

    max_tokens:
      maxTokens,
          tools: [
            analysisTool
          ],

          tool_choice: {
            type: "tool",

            name:
              "record_academic_analysis"
          },

          messages: [
            {
              role: "user",
              content:
                prompt
            }
          ]
        });

      const toolBlock =
        message.content.find(
          (item) =>
            item.type ===
              "tool_use" &&
            item.name ===
              "record_academic_analysis"
        );

      if (!toolBlock) {
        throw new Error(
          "Yapılandırılmış analiz çıktısı alınamadı."
        );
      }

      return toolBlock.input;
    } catch (error) {
      lastError = error;

      if (
        !shouldRetryApiError(
          error
        ) ||
        attempt >=
          API_RETRIES
      ) {
        throw error;
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Analiz tamamlanamadı."
    )
  );
}

// =====================================================
// PARÇA PROMPTU
// =====================================================

function createChunkPrompt(
  chunk,
  displayedIndex,
  totalSelected,
  originalTotal
) {
  return `
Sen Academic AI'nin akademik belge analiz motorusun.

Bu metin akademik belgenin bir parçasıdır.

ANALİZ SIRASI:
${displayedIndex + 1}/${totalSelected}

BELGEDEKİ PARÇA:
${chunk.index + 1}/${originalTotal}

Yalnızca bu parçada bulunan bilgileri kullan.

Bilgi uydurma.
Eksik alanları tahmin etme.

Literatürde anlatılan başka çalışmaların bulgularını,
örneklemini veya sonuçlarını bu araştırmanın kendi
bilgisi olarak kullanma.

Yöntem, desen, evren, örneklem, veri toplama ve veri
analizi bilgilerini mümkünse ayrı çıkar.

Bulgular yalnızca incelenen araştırmanın kendi
bulguları olmalıdır.

Sınırlılık sınıflandırması:

explicit:
Araştırmacı kendi araştırması için açıkça sınırlılık,
kısıt veya sınırlandırma belirtmiştir.

fact:
Belgesel gerçek vardır ama araştırmacı bunu açıkça
sınırlılık olarak adlandırmamıştır.

inference:
Academic AI belgesel bir gerçekten metodolojik
çıkarım yapmaktadır.

ÇOK ÖNEMLİ:

"katkısı sınırlıdır"
"kullanımı sınırlıdır"
"etkisi sınırlıdır"
"rolü sınırlıdır"
"kapasitesi sınırlıdır"

gibi ifadeler tek başına araştırmanın sınırlılığı
değildir.

Kanıt alanında yalnızca gerçekten belgede bulunan
kısa ve ilgili ifadeyi kullan.

BELGE PARÇASI:

${chunk.text}

Şimdi sonucu record_academic_analysis aracına gönder.
`;
}

async function analyzeChunk(
  chunk,
  displayedIndex,
  totalSelected,
  originalTotal
) {
  console.log(
    `🤖 Parça ${displayedIndex + 1}/${totalSelected} analiz ediliyor...`
  );

  const result =
    await askForStructuredAnalysis(
      createChunkPrompt(
        chunk,
        displayedIndex,
        totalSelected,
        originalTotal
      ),

      {
        maxTokens: 4000
      }
    );

  return {
    documentChunkIndex:
      chunk.index,

    documentChunkNumber:
      chunk.index + 1,

    documentChunkTotal:
      originalTotal,

    analysis:
      result
  };
}

// =====================================================
// SENTEZ
// =====================================================

function createSynthesisPrompt(
  analyses,
  fileName,
  priorityExcerpts
) {
  return `
Sen Academic AI'nin akademik sentez motorusun.

DOSYA:
${fileName}

Aşağıda aynı akademik belgenin:

1. Seçilmiş parça analizleri
2. Kritik bölümlerden alınmış doğrudan PDF metinleri

bulunmaktadır.

=====================================================
TEMEL KURAL
=====================================================

Yalnızca verilen belge içeriğine dayan.

Yeni bilgi uydurma.
Eksik bilgiyi tahmin etme.
Başka araştırmalara ait bilgileri bu araştırmaya
aitmiş gibi kullanma.

Çelişki varsa şu güven sırasını kullan:

1. Kritik ham PDF metni
2. Doğrudan belge kanıtı
3. Parça analizi

=====================================================
ÇOK ÖNEMLİ — ALANLARI BOŞ BIRAKMADAN ÖNCE KONTROL ET
=====================================================

Aşağıdaki dört alan için özellikle dikkatli ol:

1. findings
2. conclusions
3. recommendations
4. limitationEvidence

Bir parça analizinde bu alanlardan biri boş olsa bile
hemen "belirlenemedi" sonucuna varma.

ÖNCE aşağıdaki YÜKSEK GÜVENLİ KRİTİK PDF METİNLERİ
bölümünü kontrol et.

Kritik PDF metninde ilgili bilgi açıkça bulunuyorsa
onu kullan.

=====================================================
BULGULAR — findings
=====================================================

Araştırmanın kendi bulgularını çıkar.

Özellikle şu başlıkların altındaki içeriği kontrol et:

- Bulgular
- Araştırma Bulguları
- Bulgular ve Yorum
- Bulgular ve Tartışma
- Findings
- Results
- Findings and Discussion
- Results and Discussion

Araştırmanın kendi verilerinden elde edilen önemli
sonuçları findings alanına yaz.

Literatürde aktarılan başka çalışmaların bulgularını
bu araştırmanın bulgusu olarak kullanma.

findingEvidence alanında mümkün olduğunda bulgunun
dayandığı kısa belge kanıtını göster.

=====================================================
SONUÇLAR — conclusions
=====================================================

Araştırmacının araştırmadan çıkardığı temel sonuçları
conclusions alanına yaz.

Özellikle şu bölümleri kontrol et:

- Sonuç
- Sonuçlar
- Araştırmanın Sonuçları
- Sonuç ve Öneriler
- Sonuç ve Tartışma
- Conclusion
- Conclusions
- Conclusion and Recommendations

Bulguları olduğu gibi tekrar etmek yerine,
araştırmacının bulgulardan ulaştığı sonuçları çıkar.

conclusionEvidence alanında, her önemli sonuç için
belgede doğrudan bulunan kısa ve ilgili kanıtı ekle.

conclusionEvidence içindeki:

text:
Araştırmacının ulaştığı sonucu kısa ve açık biçimde yaz.

evidence:
Bu sonucu destekleyen, gerçekten belgede bulunan
kısa ifadeyi yaz.

evidenceType:
Araştırmacı sonucu açıkça ifade etmişse "explicit"
kullan.

Belgedeki bilgilerden doğrudan görülebilen bir sonuçsa
"fact" kullan.

Yalnızca Academic AI'nin yorumuyla ulaşılıyorsa
"inference" kullan; fakat mümkün olduğunca açık belge
sonuçlarını tercih et.

sourceSection:
Sonucun geldiği gerçek bölümü belirt.

Örneğin:

- Sonuç
- Sonuç ve Öneriler
- Tartışma
- Araştırma Bulguları

Parça analizinde conclusions boş olsa bile,
kritik PDF metninde açık bir sonuç bulunuyorsa
conclusions ve conclusionEvidence alanlarını doldur.

Ancak araştırmacının ulaşmadığı bir sonucu uydurma.

=====================================================

=====================================================
ÖNERİLER — recommendations
=====================================================

Araştırmacının açıkça sunduğu önerileri
recommendations alanına yaz.

Özellikle şu bölümleri kontrol et:

- Öneriler
- Araştırmacılara Öneriler
- Gelecek Araştırmalar İçin Öneriler
- Sonuç ve Öneriler
- Recommendations
- Future Research
- Future Studies
- Future Directions

Araştırmacı açık bir öneri sunmamışsa öneri uydurma.

Ancak öneri kritik PDF metninde açıkça bulunuyorsa,
parça analizinde boş olsa bile recommendations
alanına ekle.

recommendationEvidence alanında mümkün olduğunda
öneriyi destekleyen kısa belge kanıtını göster.

=====================================================
SINIRLILIKLAR — limitationEvidence
=====================================================

Sınırlılıkları üç türde değerlendir:

explicit:
Araştırmacının kendi araştırması için açıkça
sınırlılık veya kısıt olarak belirttiği bilgi.

fact:
Belgede bulunan metodolojik gerçek fakat araştırmacı
bunu açıkça sınırlılık olarak adlandırmamıştır.

inference:
Academic AI'nin belgesel bir gerçekten yaptığı
metodolojik çıkarım.

Özellikle şu başlıkları kontrol et:

- Araştırmanın Sınırlılıkları
- Çalışmanın Sınırlılıkları
- Sınırlılıklar
- Kısıtlılıklar
- Limitations
- Study Limitations

Aşağıdaki ifadeleri tek başına araştırmanın
sınırlılığı kabul etme:

- katkısı sınırlıdır
- kullanımı sınırlıdır
- etkisi sınırlıdır
- rolü sınırlıdır
- kapasitesi sınırlıdır
- erişimi sınırlıdır

Araştırmacının kendi çalışmasına ait açık sınırlılık
varsa evidenceType değerini "explicit" yap.

=====================================================
ÖZET — summary
=====================================================

summary alanında mümkün olduğunca şu yapıyı koru:

- araştırmanın amacı
- araştırma problemi
- yöntem
- araştırma deseni
- evren / örneklem
- veri toplama
- veri analizi
- temel bulgular
- temel sonuçlar

Belgede bulunmayan unsurları ekleme.

=====================================================
SON KONTROL
=====================================================

record_academic_analysis aracına göndermeden önce
kendine şu dört soruyu sor:

1. Kritik metinde Bulgular bölümü varsa findings
   alanına gerçekten baktım mı?

2. Kritik metinde Sonuç bölümü varsa conclusions
   alanına gerçekten baktım mı?

3. Kritik metinde Öneriler bölümü varsa
   recommendations alanına gerçekten baktım mı?

4. Kritik metinde gerçek bir Sınırlılıklar bölümü
   varsa limitationEvidence alanına gerçekten
   baktım mı?

Bu alanlardan birini yalnızca parça analizinde boş
olduğu için boş bırakma.

Fakat belgede gerçekten bulunmayan bilgiyi ASLA
uydurma.

=====================================================
PARÇA ANALİZLERİ
=====================================================

${JSON.stringify(
  analyses,
  null,
  2
)}

=====================================================
YÜKSEK GÜVENLİ KRİTİK PDF METİNLERİ
=====================================================

${formatPriorityExcerpts(
  priorityExcerpts
)}

Şimdi tüm kanıtları birlikte değerlendir ve sonucu
record_academic_analysis aracına gönder.
`;
}

async function synthesizeAnalyses(
  analyses,
  fileName,
  priorityExcerpts
) {
  console.log(
    "🧠 Akademik sentez hazırlanıyor..."
  );

  return await askForStructuredAnalysis(
    createSynthesisPrompt(
      analyses,
      fileName,
      priorityExcerpts
    ),

    {
      maxTokens: 7000
    }
  );
}

// =====================================================
// SINIRLILIK YEDEK KONTROLÜ
// =====================================================

function hasLimitationPriorityExcerpt(
  excerpts
) {
  return excerpts.some(
    (item) =>
      item.label ===
      "Araştırmanın Sınırlılıkları"
  );
}

async function recoverLimitationsIfNeeded(
  analysis,
  priorityExcerpts,
  fileName
) {
  const explicitCount =
    analysis
      .limitationEvidence
      .filter(
        (item) =>
          item.evidenceType ===
          "explicit"
      ).length;

  if (
    explicitCount > 0 ||
    !hasLimitationPriorityExcerpt(
      priorityExcerpts
    )
  ) {
    return analysis;
  }

  const limitationExcerpts =
    priorityExcerpts.filter(
      (item) =>
        item.label ===
        "Araştırmanın Sınırlılıkları"
    );

  console.log(
    "🔍 Sınırlılıklar için odaklı ikinci kontrol yapılıyor..."
  );

  try {
    const raw =
      await askForStructuredAnalysis(
        `
Sen Academic AI akademik doğrulama motorusun.

Aşağıdaki metinler gerçek sınırlılık başlığı
veya araştırmanın yapısına bağlı güçlü bir sınırlılık
cümlesi çevresinden alınmıştır.

Araştırmacının kendi çalışmasına ait açık sınırlılık
varsa limitationEvidence içine explicit olarak koy.

Araştırmacı söylememişse explicit kullanma.

"katkısı sınırlıdır", "etkisi sınırlıdır",
"kullanımı sınırlıdır" gibi ifadeler araştırma
sınırlılığı değildir.

Kaynakça, başka araştırma veya teorik açıklama
sınırlılık değildir.

MEVCUT SINIRLILIKLAR:

${JSON.stringify(
  analysis.limitationEvidence,
  null,
  2
)}

HAM METİN:

${formatPriorityExcerpts(
  limitationExcerpts
)}

Sonucu record_academic_analysis aracına gönder.
`,
        {
          maxTokens: 5000
        }
      );

    const recovery =
      normalizeAnalysis(
        raw,
        fileName
      );

    return {
      ...analysis,

      limitationEvidence:
        uniqueEvidenceItems([
          ...analysis
            .limitationEvidence,

          ...recovery
            .limitationEvidence
        ])
    };
  } catch (error) {
    console.error(
      "⚠️ İkinci sınırlılık kontrolü başarısız:",
      error.message
    );

    return analysis;
  }
}

// =====================================================
// SINIRLILIK İSTATİSTİĞİ
// =====================================================

function createLimitationStats(
  items
) {
  const stats = {
    explicit: 0,
    fact: 0,
    inference: 0
  };

  items.forEach(
    (item) => {
      if (
        stats[
          item.evidenceType
        ] !== undefined
      ) {
        stats[
          item.evidenceType
        ]++;
      }
    }
  );

  return stats;
}

// =====================================================
// ÜCRETSİZ / BELGE TABANLI SINIRLILIK KURTARMA
// =====================================================
//
// PDF tarayıcısının zaten bulduğu açık sınırlılık
// cümlelerini, AI sentezi kaçırırsa nihai sonuca
// geri ekler.
//
// YENİ ANTHROPIC API ÇAĞRISI YAPMAZ.
// =====================================================

function recoverDetectedLimitationsWithoutAI(
  analysis,
  priority
) {
  const detected =
    Array.isArray(
      priority?.explicitLimitations
    )
      ? priority.explicitLimitations
      : [];

  if (!detected.length) {
    return analysis;
  }

  const recoveredItems =
    detected
      .map((item) => {
        const sentence =
          safeString(
            item?.text
          );

        if (!sentence) {
          return null;
        }

        return {
          text:
            sentence,

          evidence:
            sentence,

          evidenceType:
            "explicit",

          sourceSection:
            "Araştırmanın Sınırlılıkları"
        };
      })
      .filter(Boolean);

  if (!recoveredItems.length) {
    return analysis;
  }

  return {
    ...analysis,

    limitationEvidence:
      uniqueEvidenceItems([
        ...analysis
          .limitationEvidence,

        ...recoveredItems
      ])
  };
}

// =====================================================
// NORMAL AI ANALİZİ
// =====================================================

app.post(
  "/api/analyze",
  upload.single("pdf"),
  async (req, res) => {
    let parser = null;

    try {
      if (
        !process.env
          .ANTHROPIC_API_KEY
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "Academic AI bağlantısı yapılandırılmamış."
          });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "PDF dosyası gönderilmedi."
          });
      }

      console.log("");
      console.log(
        "========================================="
      );

      console.log(
        "📄 ACADEMIC AI BELGE ANALİZİ"
      );

      console.log(
        "========================================="
      );

      parser =
        new pdfParse.PDFParse({
          data:
            req.file.buffer
        });

      const pdfResult =
        await parser.getText();

      const pdfText =
        normalizeWhitespace(
          pdfResult.text ||
            ""
        );

      if (
        !pdfText ||
        pdfText.length < 500
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "PDF içinden yeterli okunabilir metin çıkarılamadı."
          });
      }

      // =================================================
      // PDF KRİTİK BÖLÜMLERİNİ ÖNCE BUL
      // =================================================

      const priority =
        extractPriorityExcerpts(
          pdfText
        );

      // =================================================
      // PDF'Yİ PARÇALA
      // =================================================

      const allChunks =
        splitTextIntoChunks(
          pdfText
        );

      const chunkSelection =
        selectChunksForAnalysis(
          allChunks
        );

      const chunks =
        chunkSelection.selected;

      console.log(
        "✓ Metin:",
        pdfText.length,
        "karakter"
      );

      console.log(
        "📚 Toplam parça:",
        allChunks.length
      );

      console.log(
        "🤖 Analiz parçası:",
        chunks.length
      );

      console.log(
        "🎯 Güvenli kritik bölge:",
        priority.excerpts.length
      );

      // =================================================
      // YENİ DEBUG BİLGİLERİ
      // =================================================

      console.log(
        "🎯 Kritik bölümler:",
        priority.excerpts.length
          ? priority.excerpts
              .map(
                (item) =>
                  item.label
              )
              .join(" | ")
          : "YOK"
      );

      const limitationHeadingCount =
        priority.headings.filter(
          (item) =>
            item.label ===
            "Araştırmanın Sınırlılıkları"
        ).length;

      console.log(
        "🟢 Sınırlılık başlığı:",
        limitationHeadingCount
      );

      console.log(
        "🔎 Açık sınırlılık cümlesi:",
        priority
          .explicitLimitations
          .length
      );

      // =================================================
      // SEÇİLEN 3 PARÇAYI ANALİZ ET
      // =================================================

      const chunkAnalyses = [];

      for (
        let i = 0;
        i <
        chunks.length;
        i++
      ) {
        const result =
          await analyzeChunk(
            chunks[i],
            i,
            chunks.length,
            allChunks.length
          );

        chunkAnalyses.push(
          result
        );
      }

      // =================================================
      // AKADEMİK SENTEZ
      // =================================================

      const rawFinal =
        await synthesizeAnalyses(
          chunkAnalyses,
          req.file.originalname,
          priority.excerpts
        );

      let analysis =
        normalizeAnalysis(
          rawFinal,
          req.file.originalname
        );

      // =================================================
      // YENİ — ÜCRETSİZ SINIRLILIK KURTARMA
      // =================================================
      //
      // AI sentezi açık sınırlılığı kaçırdıysa,
      // PDF tarayıcısının sıkı filtrelerle daha önce
      // yakaladığı açık sınırlılık cümlelerini geri ekle.
      //
      // BU İŞLEM API ÇAĞRISI YAPMAZ.
      // =================================================

      analysis =
        recoverDetectedLimitationsWithoutAI(
          analysis,
          priority
        );

      // =================================================
      // EKONOMİK MOD
      // =================================================
      //
      // Sınırlılık için ikinci ücretli AI çağrısı
      // yapılmaz.
      //
      // Uzun PDF:
      // 3 parça + 1 sentez
      //
      // =================================================

      const limitationStats =
        createLimitationStats(
          analysis
            .limitationEvidence
        );

      const coveragePercent =
        calculateCoverage(
          chunks,
          pdfText.length
        );

      console.log("");
      console.log(
        "========================================="
      );

      console.log(
        "✅ ANALİZ TAMAMLANDI"
      );

      console.log(
        "========================================="
      );

      console.log(
        "Kapsama:",
        coveragePercent + "%"
      );

      console.log(
        "🟢 Explicit:",
        limitationStats.explicit
      );

      console.log(
        "🔵 Fact:",
        limitationStats.fact
      );

      console.log(
        "🟠 Inference:",
        limitationStats.inference
      );

      console.log(
        "========================================="
      );

      return res.json({
        success: true,

        analysis,

        meta: {
          fileName:
            req.file.originalname,

          extractedCharacters:
            pdfText.length,

          analyzedCharacters:
            Math.round(
              pdfText.length *
                (
                  coveragePercent /
                  100
                )
            ),

          coveragePercent,

          truncated:
            chunkSelection.sampled,

          sampled:
            chunkSelection.sampled,

          omittedChunkCount:
            chunkSelection.omittedCount,

          chunked:
            allChunks.length > 1,

          chunkCount:
            chunks.length,

          totalDocumentChunks:
            allChunks.length,

          chunkSize:
            calculateChunkSize(
              pdfText.length
            ),

          chunkOverlap:
            CHUNK_OVERLAP,

          referencesDetected:
            priority.referencesStart >=
            0,

          limitationHeadingCount,

          explicitLimitationSentenceCount:
            priority
              .explicitLimitations
              .length,

          priorityExcerptCount:
            priority
              .excerpts
              .length,

          limitationRegionDetected:
            hasLimitationPriorityExcerpt(
              priority.excerpts
            ),

          evidenceMode:
            true,

          structuredOutput:
            true,

          evidenceVersion:
            8,

          longDocumentMode:
            true,

          economyMode:
            true,

          maxPaidAnalysisChunks:
            ECONOMY_MAX_ANALYSIS_CHUNKS,

          estimatedApiCalls:
            chunks.length + 1,

          limitationRecovery:
            "document-recovery-no-extra-api",

          limitationStats
        }
      });
    } catch (error) {
      console.error(
        "❌ ANALİZ HATASI",
        error
      );

      const publicMessage =
        getPublicApiError(
          error,
          "analysis"
        );

      return res
        .status(
          isCreditBalanceError(
            error
          )
            ? 402
            : 500
        )
        .json({
          success: false,

          code:
            isCreditBalanceError(
              error
            )
              ? "INSUFFICIENT_API_CREDIT"
              : "ANALYSIS_ERROR",

          message:
            publicMessage
        });
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch {
          // uygulamayı durdurma
        }
      }
    }
  }
);

// =====================================================
// AI ASİSTAN YARDIMCILARI
// =====================================================

function normalizeAssistantSource(
  item,
  index
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return null;
  }

  return {
    sourceNumber:
      index + 1,

    id:
      safeString(
        String(
          item.id ??
          item.savedAt ??
          index + 1
        )
      ),

    title:
      safeString(
        item.title
      ) ||
      safeString(
        item.fileName
      ) ||
      `Kaynak ${index + 1}`,

    fileName:
      safeString(
        item.fileName
      ),

    purpose:
      safeString(
        item.purpose
      ),

    researchProblem:
      safeString(
        item.researchProblem
      ),

    method:
      safeString(
        item.method
      ),

    researchDesign:
      safeString(
        item.researchDesign
      ),

    population:
      safeString(
        item.population
      ),

    sample:
      safeString(
        item.sample
      ),

    dataCollection:
      safeString(
        item.dataCollection
      ),

    dataAnalysis:
      safeString(
        item.dataAnalysis
      ),

    summary:
      safeString(
        item.summary
      ),

    findings:
      safeStringArray(
        item.findings
      ).slice(
        0,
        15
      ),

    conclusions:
      safeStringArray(
        item.conclusions
      ).slice(
        0,
        15
      ),

    recommendations:
      safeStringArray(
        item.recommendations
      ).slice(
        0,
        12
      ),

    keywords:
      safeStringArray(
        item.keywords
      ).slice(
        0,
        15
      ),

    contribution:
      safeString(
        item.contribution
      ),

    findingEvidence:
      normalizeEvidenceArray(
        item.findingEvidence
      ).slice(
        0,
        15
      ),

    limitationEvidence:
      normalizeEvidenceArray(
        item.limitationEvidence
      ).slice(
        0,
        12
      ),

    recommendationEvidence:
      normalizeEvidenceArray(
        item.recommendationEvidence
      ).slice(
        0,
        12
      )
  };
}

function buildAssistantSourceText(
  sources
) {
  let output = "";

  for (
    const source of
    sources
  ) {
    const block = `
=====================================================
KAYNAK ${source.sourceNumber}
=====================================================

Başlık:
${source.title || "Belirtilmemiş"}

Dosya:
${source.fileName || "Belirtilmemiş"}

Amaç:
${source.purpose || "Belirtilmemiş"}

Araştırma problemi:
${source.researchProblem || "Belirtilmemiş"}

Yöntem:
${source.method || "Belirtilmemiş"}

Araştırma deseni:
${source.researchDesign || "Belirtilmemiş"}

Evren:
${source.population || "Belirtilmemiş"}

Örneklem:
${source.sample || "Belirtilmemiş"}

Veri toplama:
${source.dataCollection || "Belirtilmemiş"}

Veri analizi:
${source.dataAnalysis || "Belirtilmemiş"}

Özet:
${source.summary || "Belirtilmemiş"}

Bulgular:
${
  source.findings.length
    ? source.findings
        .map(
          (item) =>
            `- ${item}`
        )
        .join("\n")
    : "Belirtilmemiş"
}

Sonuçlar:
${
  source.conclusions.length
    ? source.conclusions
        .map(
          (item) =>
            `- ${item}`
        )
        .join("\n")
    : "Belirtilmemiş"
}

Sınırlılıklar:
${
  source.limitationEvidence.length
    ? source.limitationEvidence
        .map(
          (item) =>
            `- [${item.evidenceType}] ${item.text}` +
            (
              item.evidence
                ? ` | Kanıt: ${item.evidence}`
                : ""
            )
        )
        .join("\n")
    : "Belirtilmemiş"
}

Öneriler:
${
  source.recommendations.length
    ? source.recommendations
        .map(
          (item) =>
            `- ${item}`
        )
        .join("\n")
    : "Belirtilmemiş"
}

Anahtar kavramlar:
${
  source.keywords.length
    ? source.keywords.join(
        ", "
      )
    : "Belirtilmemiş"
}

Akademik katkı:
${source.contribution || "Belirtilmemiş"}
`;

    if (
      (
        output.length +
        block.length
      ) >
      ASSISTANT_MAX_SOURCE_CHARS
    ) {
      break;
    }

    output += block;
  }

  return output;
}

// =====================================================
// AI ASİSTAN ENDPOINT
// =====================================================

app.post(
  "/api/assistant",
  async (req, res) => {
    try {
      if (
        !process.env
          .ANTHROPIC_API_KEY
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "Academic AI bağlantısı yapılandırılmamış."
          });
      }

      const question =
        safeString(
          req.body?.question
        );

      const rawSources =
        Array.isArray(
          req.body?.sources
        )
          ? req.body.sources
          : [];

      const researchProject =
        req.body?.researchProject &&
        typeof req.body
          .researchProject ===
          "object"
          ? req.body
              .researchProject
          : null;

      if (!question) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Asistana bir soru yazmalısın."
          });
      }

      if (!rawSources.length) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "AI Asistanı kullanmak için önce en az bir akademik çalışmayı Literatürüm'e kaydetmelisin."
          });
      }

      const sources =
        rawSources
          .slice(
            0,
            ASSISTANT_MAX_SOURCES
          )
          .map(
            normalizeAssistantSource
          )
          .filter(Boolean);

      if (!sources.length) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Kullanılabilir kaynak verisi bulunamadı."
          });
      }

      const sourceText =
        buildAssistantSourceText(
          sources
        );

      if (!sourceText.trim()) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Kaynakların analiz verileri boş görünüyor."
          });
      }

      const researchContext =
        researchProject
          ? `
=====================================================
KULLANICININ ARAŞTIRMA PROJESİ
=====================================================

Araştırma konusu:
${safeString(
  researchProject.topic
) || "Belirtilmemiş"}

Amaç:
${safeString(
  researchProject.purpose
) || "Belirtilmemiş"}

Problem:
${safeString(
  researchProject.problem
) || "Belirtilmemiş"}

Ana araştırma sorusu:
${safeString(
  researchProject.mainQuestion
) || "Belirtilmemiş"}

Kapsam:
${safeString(
  researchProject.scope
) || "Belirtilmemiş"}

Hedef grup:
${safeString(
  researchProject.targetGroup
) || "Belirtilmemiş"}

Anahtar kavramlar:
${
  Array.isArray(
    researchProject.keywords
  )
    ? researchProject
        .keywords
        .slice(
          0,
          15
        )
        .join(
          ", "
        )
    : "Belirtilmemiş"
}
`
          : "";

      console.log("");
      console.log(
        "========================================="
      );

      console.log(
        "✦ ACADEMIC AI ASİSTAN"
      );

      console.log(
        "========================================="
      );

      console.log(
        "Soru:",
        question
      );

      console.log(
        "Kaynak sayısı:",
        sources.length
      );

      const prompt = `
Sen Academic AI'nin kaynak tabanlı akademik araştırma asistanısın.

Kullanıcı sana kendi literatürüne kaydettiği akademik
çalışmalar üzerinden soru soruyor.

=====================================================
ÇOK ÖNEMLİ KURAL
=====================================================

YALNIZCA aşağıda verilen kaynak verilerini kullan.

Kaynaklarda bulunmayan bir akademik bilgiyi gerçekmiş
gibi üretme.

İnternetten bilgi ekleme.

Genel bilginle boşluk doldurma.

Bir bilgi kaynaklarda yoksa açıkça:

"Bu bilgi seçili kaynaklarda bulunmuyor."

veya

"Mevcut kaynaklardan bunu güvenilir biçimde
belirleyemiyorum."

de.

=====================================================
KAYNAK GÖSTERME
=====================================================

Cevabındaki önemli akademik iddiaların sonunda
kaynak numarasını göster.

Format:

[Kaynak 1]

veya birden fazla kaynak destekliyorsa:

[Kaynak 1, Kaynak 3]

Kaynak numaralarını ASLA uydurma.

Yalnızca aşağıdaki gerçek kaynak numaralarını kullan.

=====================================================
KARŞILAŞTIRMA
=====================================================

Kullanıcı kaynakları karşılaştırmanı isterse:

- yöntem
- araştırma deseni
- örneklem
- veri toplama
- veri analizi
- bulgular
- sonuçlar
- sınırlılıklar
- anahtar kavramlar

alanlarını gerektiği kadar karşılaştır.

Benzerlik ile aynılığı karıştırma.

Farklılık ile akademik çelişkiyi karıştırma.

=====================================================
ARAŞTIRMA BOŞLUĞU
=====================================================

Kullanıcı araştırma boşluğu sorarsa bunu kesin gerçek
olarak sunma.

Şu ifadeleri tercih et:

- "potansiyel araştırma boşluğu"
- "mevcut seçili kaynaklara göre"
- "daha az ele alınmış görünen"
- "daha fazla araştırma gerektiren"

Kaynak sayısı azsa bunu mutlaka belirt.

=====================================================
SINIRLILIKLAR
=====================================================

explicit:
Araştırmacının açıkça belirttiği sınırlılık.

fact:
Belgede bulunan metodolojik gerçek.

inference:
Academic AI tarafından yapılan çıkarım.

Bunları birbirine karıştırma.

=====================================================
TEZDE KULLANIM
=====================================================

Kullanıcı:

"Tezimde nasıl kullanabilirim?"

gibi bir soru sorarsa kaynaklara dayanarak öner:

- Giriş
- Literatür
- Yöntem
- Bulgular
- Tartışma
- Sonuç

Ancak kullanıcıya doğrudan kopyalanacak sahte akademik
metin üretme.

Kaynakların nasıl kullanılabileceğini açıkla.

=====================================================
CEVAP BİÇİMİ
=====================================================

Türkçe cevap ver.

Açık, akademik ve anlaşılır yaz.

Gereksiz uzunluk oluşturma.

Sorunun yapısına göre başlık veya madde kullanabilirsin.

Kaynaklarda yeterli bilgi yoksa bunu saklama.

${researchContext}

=====================================================
KULLANICININ SORUSU
=====================================================

${question}

=====================================================
SEÇİLİ AKADEMİK KAYNAKLAR
=====================================================

${sourceText}

=====================================================
SON
=====================================================

Şimdi yalnızca bu kaynaklara dayanarak soruyu cevapla.
`;

      const message =
        await anthropic.messages.create({
          model:
            "claude-sonnet-5",

          max_tokens:
            2800,
            
          messages: [
            {
              role:
                "user",

              content:
                prompt
            }
          ]
        });

      const answer =
        message.content
          .filter(
            (item) =>
              item.type ===
              "text"
          )
          .map(
            (item) =>
              item.text
          )
          .join("\n")
          .trim();

      if (!answer) {
        throw new Error(
          "AI Asistan yanıt üretemedi."
        );
      }

      console.log(
        "✓ AI Asistan yanıtı hazır."
      );

      console.log(
        "========================================="
      );

      return res.json({
        success: true,

        answer,

        sourceCount:
          sources.length,

        sources:
          sources.map(
            (source) => ({
              sourceNumber:
                source.sourceNumber,

              id:
                source.id,

              title:
                source.title,

              fileName:
                source.fileName
            })
          )
      });
    } catch (error) {
      console.error(
        "❌ AI ASİSTAN HATASI:",
        error
      );

      const publicMessage =
        getPublicApiError(
          error,
          "assistant"
        );

      return res
        .status(
          isCreditBalanceError(
            error
          )
            ? 402
            : 500
        )
        .json({
          success: false,

          code:
            isCreditBalanceError(
              error
            )
              ? "INSUFFICIENT_API_CREDIT"
              : "ASSISTANT_ERROR",

          message:
            publicMessage
        });
    }
  }
);

// =====================================================
// TEST
// =====================================================

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      success: true,

      message:
        "Academic AI sistemi çalışıyor.",

      freePdfDebug: true,

      freePdfDebugEndpoint:
        "/api/debug-pdf",

      assistant:
        true,

      assistantEndpoint:
        "/api/assistant",

      criticalSectionVersion:
        3,

      evidenceVersion:
        7,

      model:
        "claude-sonnet-5"
    });
  }
);

// =====================================================
// 404
// =====================================================

app.use(
  "/api",
  (req, res) => {
    res
      .status(404)
      .json({
        success: false,

        message:
          "Academic AI API adresi bulunamadı."
      });
  }
);

// =====================================================
// SERVER
// =====================================================

app.listen(
  PORT,
  () => {
    console.log("");

    console.log(
      "========================================="
    );

    console.log(
      "🎓 ACADEMIC AI"
    );

    console.log(
      "========================================="
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      "💸 Ekonomik uzun PDF modu V4: AÇIK"
    );

    console.log(
      "   En fazla 3 parça + 1 sentez"
    );

    console.log(
      "♻️ Ekstra sınırlılık AI çağrısı: KAPALI"
    );

    console.log(
      "🆓 Kredisiz PDF test modu: AÇIK"
    );

    console.log(
      "🎯 Kritik bölüm filtresi V3: AÇIK"
    );

    console.log(
      "📚 Kaynakça filtresi: AÇIK"
    );

    console.log(
      "🟢 Gerçek sınırlılık başlığı kontrolü: AÇIK"
    );

    console.log(
      "🔎 Sıkı sınırlılık cümlesi filtresi: AÇIK"
    );

    console.log(
      "🚫 Yanlış 'sınırlıdır' filtresi: AÇIK"
    );

    console.log(
      "🔵 Belgesel gerçek ayrımı: AÇIK"
    );

    console.log(
      "🟠 AI çıkarımı ayrımı: AÇIK"
    );

    console.log(
      "♻️ Sınırlılık ikinci AI kontrolü: KAPALI"
    );

    console.log(
      "🧩 Yapılandırılmış çıktı: AÇIK"
    );

    console.log(
      "✦ Kaynak tabanlı AI Asistan: AÇIK"
    );

    console.log(
      "   POST /api/assistant"
    );

   console.log(

  "🤖 Model: claude-sonnet-5"

);

    if (
      process.env
        .ANTHROPIC_API_KEY
    ) {
      console.log(
        "✅ Sistem bağlantısı hazır."
      );
    } else {
      console.log(
        "❌ Sistem bağlantısı eksik."
      );
    }

    console.log(
      "========================================="
    );

    console.log("");
  }
);