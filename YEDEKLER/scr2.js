// =====================================================
// ACADEMIC AI — SCRIPT.JS
// ÜÇLÜ KANIT MODU
// ÜCRETSİZ LİTERATÜR ANALİZİ
// ARAŞTIRMA ÇALIŞMA ALANI
// KAYNAK TABANLI AI ASİSTAN
// =====================================================

// =====================================================
// SAYFA GEÇİŞLERİ
// =====================================================

const pages = [...document.querySelectorAll(".page")];
const navItems = [...document.querySelectorAll(".nav-item")];

const crumb = document.getElementById("crumb");
const sidebar = document.querySelector(".sidebar");
const menuBtn = document.getElementById("menuBtn");

const pageNames = {
  home: "Ana Panel",
  research: "Araştırma",
  literature: "Literatürüm",
  papers: "Makalelerim",
  analysis: "Literatür Analizi",
  notes: "Notlarım",
  thesis: "Tez / Doktora Projem",
  citations: "Atıf & Kaynakça",
  assistant: "AI Asistan"
};

function go(page) {
  pages.forEach((p) => {
    p.classList.toggle("active", p.id === page);
  });

  navItems.forEach((n) => {
    n.classList.toggle(
      "active",
      n.dataset.page === page
    );
  });

  if (crumb) {
    crumb.textContent =
      pageNames[page] || page;
  }

  sidebar?.classList.remove("open");

  if (page === "analysis") {
    renderLiteratureAnalysis();
  }

  if (page === "research") {
    restoreResearchProject();
  }

  if (page === "assistant") {
    updateAssistantSourceStatus();
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    go(item.dataset.page);
  });
});

document
  .querySelectorAll("[data-go]")
  .forEach((element) => {
    element.addEventListener(
      "click",
      () => {
        go(element.dataset.go);
      }
    );
  });

menuBtn?.addEventListener(
  "click",
  () => {
    sidebar?.classList.toggle("open");
  }
);

// =====================================================
// GENEL YARDIMCILAR
// =====================================================

function setText(
  id,
  value,
  fallback = "Belirlenemedi."
) {
  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent =
    typeof value === "string" &&
    value.trim()
      ? value.trim()
      : fallback;
}

function cleanValue(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function shorten(
  text,
  max = 150
) {
  if (!text) return "—";

  const value =
    String(text).trim();

  if (value.length <= max) {
    return value;
  }

  return (
    value
      .slice(0, max)
      .trim() + "…"
  );
}

function getItemId(item) {
  return String(
    item?.id ??
      item?.savedAt ??
      item?.fileName ??
      item?.title ??
      ""
  );
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

// =====================================================
// ARAŞTIRMA ÇALIŞMA ALANI
// =====================================================

const newResearchButton =
  document.getElementById(
    "newResearchButton"
  );

const researchTopic =
  document.getElementById(
    "researchTopic"
  );

const buildResearchFramework =
  document.getElementById(
    "buildResearchFramework"
  );

const researchFramework =
  document.getElementById(
    "researchFramework"
  );

const researchFrameworkStatus =
  document.getElementById(
    "researchFrameworkStatus"
  );

const researchPurposeDraft =
  document.getElementById(
    "researchPurposeDraft"
  );

const researchProblemDraft =
  document.getElementById(
    "researchProblemDraft"
  );

const mainResearchQuestion =
  document.getElementById(
    "mainResearchQuestion"
  );

const researchQuestionsList =
  document.getElementById(
    "researchQuestionsList"
  );

const addResearchQuestion =
  document.getElementById(
    "addResearchQuestion"
  );

const researchScope =
  document.getElementById(
    "researchScope"
  );

const researchTargetGroup =
  document.getElementById(
    "researchTargetGroup"
  );

const researchKeywordInput =
  document.getElementById(
    "researchKeywordInput"
  );

const addResearchKeyword =
  document.getElementById(
    "addResearchKeyword"
  );

const researchKeywordsDraft =
  document.getElementById(
    "researchKeywordsDraft"
  );

const turkishSearchTerms =
  document.getElementById(
    "turkishSearchTerms"
  );

const englishSearchTerms =
  document.getElementById(
    "englishSearchTerms"
  );

const saveResearchFramework =
  document.getElementById(
    "saveResearchFramework"
  );

const clearResearchFramework =
  document.getElementById(
    "clearResearchFramework"
  );

const researchSaveStatus =
  document.getElementById(
    "researchSaveStatus"
  );

let researchKeywords = [];

// =====================================================
// ARAŞTIRMA PROJESİ DEPOLAMA
// =====================================================

function getResearchProject() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "academicAIResearchProject"
      ) || "null"
    );
  } catch {
    return null;
  }
}

function setResearchProject(
  project
) {
  localStorage.setItem(
    "academicAIResearchProject",
    JSON.stringify(project)
  );
}

// =====================================================
// KONU İÇİNDEN BASİT KAVRAM ÜRETİMİ
// API YOK
// =====================================================

const researchStopWords =
  new Set([
    "ve",
    "ile",
    "bir",
    "bu",
    "şu",
    "için",
    "olan",
    "olarak",
    "üzerinde",
    "üzerine",
    "etkisi",
    "etkileri",
    "arasındaki",
    "ilişkisi",
    "ilişki",
    "kullanımı",
    "kullanım",
    "süreçleri",
    "süreci",
    "bağlamında",
    "açısından",
    "üzerindeki",
    "nasıl",
    "nedir",
    "nelerdir"
  ]);

function extractResearchKeywords(
  topic
) {
  const words =
    normalizeSearchText(topic)
      .split(" ")
      .filter(
        (word) =>
          word.length >= 4 &&
          !researchStopWords.has(
            word
          )
      );

  const unique = [];

  words.forEach((word) => {
    if (!unique.includes(word)) {
      unique.push(word);
    }
  });

  return unique
    .slice(0, 8)
    .map((word) =>
      word
        .split(" ")
        .map(
          (part) =>
            part
              .charAt(0)
              .toLocaleUpperCase(
                "tr-TR"
              ) +
            part.slice(1)
        )
        .join(" ")
    );
}

// =====================================================
// TÜRKÇE → İNGİLİZCE TEMEL AKADEMİK TERİM HARİTASI
// =====================================================

const academicTermDictionary = {
  yapay: "artificial",
  zekâ: "intelligence",
  zeka: "intelligence",
  gazetecilik: "journalism",
  gazeteci: "journalist",
  gazeteciler: "journalists",
  haber: "news",
  üretim: "production",
  üretimi: "production",
  medya: "media",
  dijital: "digital",
  dönüşüm: "transformation",
  eğitim: "education",
  yükseköğretim:
    "higher education",
  akademik: "academic",
  yazma: "writing",
  öğrenci: "student",
  öğrenciler: "students",
  öğretmen: "teacher",
  öğretmenler: "teachers",
  editör: "editor",
  editörler: "editors",
  editoryal: "editorial",
  sosyal: "social",
  iletişim: "communication",
  teknoloji: "technology",
  teknolojileri:
    "technologies",
  otomasyon: "automation",
  üretken: "generative",
  etik: "ethics",
  doğruluk: "accuracy",
  güvenilirlik:
    "reliability",
  bağımsızlık:
    "independence",
  karar: "decision",
  kararları: "decisions"
};

function translateKeywordBasic(
  keyword
) {
  const words =
    normalizeSearchText(keyword)
      .split(" ")
      .filter(Boolean);

  const translated =
    words.map(
      (word) =>
        academicTermDictionary[
          word
        ] || word
    );

  return translated.join(" ");
}

// =====================================================
// ARAŞTIRMA ÇERÇEVESİ TASLAĞI
// =====================================================

function generateResearchFrameworkDraft(
  topic
) {
  const cleanTopic =
    cleanValue(topic);

  const lower =
    cleanTopic.toLocaleLowerCase(
      "tr-TR"
    );

  const subject =
    cleanTopic;

  let targetGroup = "";

  if (
    lower.includes(
      "gazeteci"
    ) ||
    lower.includes(
      "habercilik"
    ) ||
    lower.includes(
      "gazetecilik"
    )
  ) {
    targetGroup =
      "Gazeteciler, muhabirler, editörler veya ilgili medya profesyonelleri";
  } else if (
    lower.includes(
      "öğrenci"
    ) ||
    lower.includes(
      "yükseköğretim"
    )
  ) {
    targetGroup =
      "Araştırma konusuyla ilişkili öğrenciler ve/veya yükseköğretim paydaşları";
  } else if (
    lower.includes(
      "öğretmen"
    ) ||
    lower.includes(
      "eğitim"
    )
  ) {
    targetGroup =
      "Araştırma konusuyla ilişkili eğitim paydaşları";
  }

  const purpose =
    `Bu araştırmanın temel amacı, ${subject} konusunu sistematik biçimde incelemek; ilgili aktörlerin deneyimlerini, kullanım biçimlerini, etkileri ve ortaya çıkan temel sorunları değerlendirmektir.`;

  const problem =
    `${subject} konusunda uygulamada ve literatürde ortaya çıkan dönüşümün kapsamı, etkileri ve ilgili aktörler açısından sonuçları yeterince açıklığa kavuşturulmamış olabilir. Araştırma bu konuyu belirli bir bağlam içinde incelemeyi amaçlamaktadır.`;

  const mainQuestion =
    `${subject} nasıl gerçekleşmekte ve ilgili süreçler üzerinde ne tür etkiler oluşturmaktadır?`;

  const questions = [
    `${subject} kapsamında öne çıkan başlıca kullanım veya uygulama biçimleri nelerdir?`,
    `İlgili aktörler bu sürecin avantajlarını ve sorunlarını nasıl değerlendirmektedir?`,
    `Bu süreç mesleki, akademik veya kurumsal pratikleri nasıl etkilemektedir?`
  ];

  const scope =
    "Araştırmanın coğrafi alanı, hedef grubu, kurum türü ve incelenecek dönem araştırmacı tarafından sınırlandırılmalıdır.";

  return {
    purpose,
    problem,
    mainQuestion,
    questions,
    scope,
    targetGroup
  };
}

// =====================================================
// ARAMA DİZİLERİ
// =====================================================

function buildSearchStrings(
  topic,
  keywords
) {
  const cleanTopic =
    cleanValue(topic);

  const cleanKeywords =
    keywords
      .map(cleanValue)
      .filter(Boolean);

  const selected =
    cleanKeywords.slice(0, 5);

  let turkish = "";

  if (selected.length >= 2) {
    turkish =
      `"${selected[0]}" AND "${selected[1]}"`;

    if (selected[2]) {
      turkish +=
        `\n"${selected[0]}" AND "${selected[2]}"`;
    }

    if (selected[3]) {
      turkish +=
        `\n"${selected[1]}" AND "${selected[3]}"`;
    }
  } else {
    turkish =
      `"${cleanTopic}"`;
  }

  const translated =
    selected.map(
      translateKeywordBasic
    );

  let english = "";

  if (
    translated.length >= 2
  ) {
    english =
      `"${translated[0]}" AND "${translated[1]}"`;

    if (translated[2]) {
      english +=
        `\n"${translated[0]}" AND "${translated[2]}"`;
    }

    if (translated[3]) {
      english +=
        `\n"${translated[1]}" AND "${translated[3]}"`;
    }
  } else {
    english =
      `"${translateKeywordBasic(
        cleanTopic
      )}"`;
  }

  return {
    turkish,
    english
  };
}

// =====================================================
// ARAŞTIRMA ANAHTAR KAVRAMLARI
// =====================================================

function renderResearchKeywords() {
  if (
    !researchKeywordsDraft
  ) {
    return;
  }

  researchKeywordsDraft.innerHTML =
    "";

  if (
    !researchKeywords.length
  ) {
    const empty =
      document.createElement(
        "small"
      );

    empty.className =
      "research-keyword-empty";

    empty.textContent =
      "Henüz anahtar kavram eklenmedi.";

    researchKeywordsDraft
      .appendChild(empty);

    return;
  }

  researchKeywords.forEach(
    (keyword, index) => {
      const tag =
        document.createElement(
          "span"
        );

      tag.className =
        "research-keyword-tag";

      const text =
        document.createElement(
          "b"
        );

      text.textContent =
        keyword;

      const remove =
        document.createElement(
          "button"
        );

      remove.type =
        "button";

      remove.textContent =
        "×";

      remove.title =
        "Kavramı kaldır";

      remove.addEventListener(
        "click",
        () => {
          researchKeywords.splice(
            index,
            1
          );

          renderResearchKeywords();

          refreshSearchTerms();
        }
      );

      tag.appendChild(text);
      tag.appendChild(remove);

      researchKeywordsDraft
        .appendChild(tag);
    }
  );
}

function addResearchKeywordValue(
  value
) {
  const keyword =
    cleanValue(value);

  if (!keyword) return;

  const exists =
    researchKeywords.some(
      (item) =>
        item.toLocaleLowerCase(
          "tr-TR"
        ) ===
        keyword.toLocaleLowerCase(
          "tr-TR"
        )
    );

  if (!exists) {
    researchKeywords.push(
      keyword
    );
  }

  renderResearchKeywords();
  refreshSearchTerms();

  if (researchKeywordInput) {
    researchKeywordInput.value =
      "";
  }
}

addResearchKeyword
  ?.addEventListener(
    "click",
    () => {
      addResearchKeywordValue(
        researchKeywordInput
          ?.value
      );
    }
  );

researchKeywordInput
  ?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        addResearchKeywordValue(
          researchKeywordInput
            .value
        );
      }
    }
  );

// =====================================================
// ALT ARAŞTIRMA SORULARI
// =====================================================

function renumberResearchQuestions() {
  if (
    !researchQuestionsList
  ) {
    return;
  }

  const rows = [
    ...researchQuestionsList
      .querySelectorAll(
        ".research-question-row"
      )
  ];

  rows.forEach(
    (row, index) => {
      const number =
        row.querySelector(
          "span"
        );

      if (number) {
        number.textContent =
          String(index + 1);
      }
    }
  );
}

function attachResearchQuestionDeleteButtons() {
  if (
    !researchQuestionsList
  ) {
    return;
  }

  researchQuestionsList
    .querySelectorAll(
      ".remove-question"
    )
    .forEach((button) => {
      button.onclick = () => {
        const rows =
          researchQuestionsList
            .querySelectorAll(
              ".research-question-row"
            );

        if (
          rows.length <= 1
        ) {
          const input =
            button
              .closest(
                ".research-question-row"
              )
              ?.querySelector(
                ".research-sub-question"
              );

          if (input) {
            input.value = "";
          }

          return;
        }

        button
          .closest(
            ".research-question-row"
          )
          ?.remove();

        renumberResearchQuestions();
      };
    });
}

function addResearchQuestionRow(
  value = ""
) {
  if (
    !researchQuestionsList
  ) {
    return;
  }

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "research-question-row";

  const number =
    document.createElement(
      "span"
    );

  const input =
    document.createElement(
      "input"
    );

  input.className =
    "research-sub-question";

  input.type = "text";

  input.placeholder =
    "Alt araştırma sorusu";

  input.value = value;

  const remove =
    document.createElement(
      "button"
    );

  remove.className =
    "remove-question";

  remove.type =
    "button";

  remove.title =
    "Soruyu sil";

  remove.textContent =
    "×";

  row.appendChild(number);
  row.appendChild(input);
  row.appendChild(remove);

  researchQuestionsList
    .appendChild(row);

  renumberResearchQuestions();

  attachResearchQuestionDeleteButtons();
}

addResearchQuestion
  ?.addEventListener(
    "click",
    () => {
      addResearchQuestionRow();
    }
  );

attachResearchQuestionDeleteButtons();

// =====================================================
// ARAMA TERİMLERİNİ YENİLE
// =====================================================

function refreshSearchTerms() {
  const topic =
    researchTopic?.value ||
    "";

  const search =
    buildSearchStrings(
      topic,
      researchKeywords
    );

  if (turkishSearchTerms) {
    turkishSearchTerms.value =
      search.turkish;
  }

  if (englishSearchTerms) {
    englishSearchTerms.value =
      search.english;
  }
}

// =====================================================
// ARAŞTIRMA ÇERÇEVESİ OLUŞTUR
// =====================================================

buildResearchFramework
  ?.addEventListener(
    "click",
    () => {
      const topic =
        cleanValue(
          researchTopic?.value
        );

      if (!topic) {
        if (
          researchFrameworkStatus
        ) {
          researchFrameworkStatus.hidden =
            false;

          researchFrameworkStatus.className =
            "research-status error";

          researchFrameworkStatus.textContent =
            "Önce araştırma konunu yazmalısın.";
        }

        return;
      }

      const draft =
        generateResearchFrameworkDraft(
          topic
        );

      researchKeywords =
        extractResearchKeywords(
          topic
        );

      if (
        researchPurposeDraft
      ) {
        researchPurposeDraft.value =
          draft.purpose;
      }

      if (
        researchProblemDraft
      ) {
        researchProblemDraft.value =
          draft.problem;
      }

      if (
        mainResearchQuestion
      ) {
        mainResearchQuestion.value =
          draft.mainQuestion;
      }

      if (researchScope) {
        researchScope.value =
          draft.scope;
      }

      if (
        researchTargetGroup
      ) {
        researchTargetGroup.value =
          draft.targetGroup;
      }

      if (
        researchQuestionsList
      ) {
        researchQuestionsList.innerHTML =
          "";

        draft.questions.forEach(
          (question) => {
            addResearchQuestionRow(
              question
            );
          }
        );
      }

      renderResearchKeywords();
      refreshSearchTerms();

      if (
        researchFramework
      ) {
        researchFramework.hidden =
          false;
      }

      if (
        researchFrameworkStatus
      ) {
        researchFrameworkStatus.hidden =
          false;

        researchFrameworkStatus.className =
          "research-status success";

        researchFrameworkStatus.textContent =
          "✓ İlk araştırma çerçevesi hazırlandı. Alanları kendi araştırmana göre düzenleyebilirsin.";
      }

      researchFramework
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }
  );

// =====================================================
// ARAŞTIRMA FORMUNU OKU
// =====================================================

function collectResearchProject() {
  const questions = [
    ...document.querySelectorAll(
      ".research-sub-question"
    )
  ]
    .map((input) =>
      cleanValue(
        input.value
      )
    )
    .filter(Boolean);

  return {
    topic:
      cleanValue(
        researchTopic?.value
      ),

    purpose:
      cleanValue(
        researchPurposeDraft
          ?.value
      ),

    problem:
      cleanValue(
        researchProblemDraft
          ?.value
      ),

    mainQuestion:
      cleanValue(
        mainResearchQuestion
          ?.value
      ),

    questions,

    scope:
      cleanValue(
        researchScope?.value
      ),

    targetGroup:
      cleanValue(
        researchTargetGroup
          ?.value
      ),

    keywords: [
      ...researchKeywords
    ],

    turkishSearchTerms:
      cleanValue(
        turkishSearchTerms
          ?.value
      ),

    englishSearchTerms:
      cleanValue(
        englishSearchTerms
          ?.value
      ),

    updatedAt:
      new Date()
        .toISOString()
  };
}

// =====================================================
// ARAŞTIRMA PROJESİNİ KAYDET
// =====================================================

saveResearchFramework
  ?.addEventListener(
    "click",
    () => {
      const project =
        collectResearchProject();

      if (!project.topic) {
        if (
          researchSaveStatus
        ) {
          researchSaveStatus.hidden =
            false;

          researchSaveStatus.className =
            "research-status error";

          researchSaveStatus.textContent =
            "Araştırmayı kaydetmek için araştırma konusu gerekli.";
        }

        return;
      }

      setResearchProject(
        project
      );

      if (
        researchSaveStatus
      ) {
        researchSaveStatus.hidden =
          false;

        researchSaveStatus.className =
          "research-status success";

        researchSaveStatus.textContent =
          "✓ Araştırma çerçevesi kaydedildi. Bu tarayıcıda tekrar açtığında çalışmana devam edebilirsin.";
      }

      updateAssistantSourceStatus();
    }
  );

// =====================================================
// ARAŞTIRMA PROJESİNİ GERİ YÜKLE
// =====================================================

function restoreResearchProject() {
  const project =
    getResearchProject();

  if (!project) {
    return;
  }

  if (researchTopic) {
    researchTopic.value =
      project.topic || "";
  }

  if (
    researchPurposeDraft
  ) {
    researchPurposeDraft.value =
      project.purpose || "";
  }

  if (
    researchProblemDraft
  ) {
    researchProblemDraft.value =
      project.problem || "";
  }

  if (
    mainResearchQuestion
  ) {
    mainResearchQuestion.value =
      project.mainQuestion || "";
  }

  if (researchScope) {
    researchScope.value =
      project.scope || "";
  }

  if (
    researchTargetGroup
  ) {
    researchTargetGroup.value =
      project.targetGroup || "";
  }

  if (
    turkishSearchTerms
  ) {
    turkishSearchTerms.value =
      project
        .turkishSearchTerms ||
      "";
  }

  if (
    englishSearchTerms
  ) {
    englishSearchTerms.value =
      project
        .englishSearchTerms ||
      "";
  }

  researchKeywords =
    Array.isArray(
      project.keywords
    )
      ? [
          ...project.keywords
        ]
      : [];

  renderResearchKeywords();

  if (
    researchQuestionsList
  ) {
    researchQuestionsList.innerHTML =
      "";

    const questions =
      Array.isArray(
        project.questions
      ) &&
      project.questions.length
        ? project.questions
        : [""];

    questions.forEach(
      (question) => {
        addResearchQuestionRow(
          question
        );
      }
    );
  }

  if (
    researchFramework
  ) {
    researchFramework.hidden =
      false;
  }
}

// =====================================================
// ARAŞTIRMA FORMUNU TEMİZLE
// =====================================================

function resetResearchWorkspace() {
  if (researchTopic) {
    researchTopic.value = "";
  }

  if (
    researchPurposeDraft
  ) {
    researchPurposeDraft.value =
      "";
  }

  if (
    researchProblemDraft
  ) {
    researchProblemDraft.value =
      "";
  }

  if (
    mainResearchQuestion
  ) {
    mainResearchQuestion.value =
      "";
  }

  if (researchScope) {
    researchScope.value =
      "";
  }

  if (
    researchTargetGroup
  ) {
    researchTargetGroup.value =
      "";
  }

  if (
    turkishSearchTerms
  ) {
    turkishSearchTerms.value =
      "";
  }

  if (
    englishSearchTerms
  ) {
    englishSearchTerms.value =
      "";
  }

  researchKeywords = [];

  renderResearchKeywords();

  if (
    researchQuestionsList
  ) {
    researchQuestionsList.innerHTML =
      "";

    addResearchQuestionRow();
    addResearchQuestionRow();
    addResearchQuestionRow();
  }

  if (
    researchFramework
  ) {
    researchFramework.hidden =
      true;
  }

  if (
    researchFrameworkStatus
  ) {
    researchFrameworkStatus.hidden =
      true;
  }

  if (
    researchSaveStatus
  ) {
    researchSaveStatus.hidden =
      true;
  }
}

clearResearchFramework
  ?.addEventListener(
    "click",
    () => {
      resetResearchWorkspace();
    }
  );

newResearchButton
  ?.addEventListener(
    "click",
    () => {
      const existing =
        getResearchProject();

      if (existing) {
        const confirmed =
          window.confirm(
            "Yeni araştırma başlatılırsa mevcut kaydedilmiş araştırma çerçevesi silinecek. Devam etmek istiyor musun?"
          );

        if (!confirmed) {
          return;
        }
      }

      localStorage.removeItem(
        "academicAIResearchProject"
      );

      resetResearchWorkspace();

      go("research");

      updateAssistantSourceStatus();
    }
  );

// =====================================================
// PDF YÜKLEME
// =====================================================

const uploadButton =
  document.getElementById(
    "uploadButton"
  );

const pdfInput =
  document.getElementById(
    "pdfInput"
  );

const fileInfo =
  document.getElementById(
    "fileInfo"
  );

const analyzeButton =
  document.getElementById(
    "analyzeButton"
  );

const statusBox =
  document.getElementById(
    "analysisStatus"
  );

const resultBox =
  document.getElementById(
    "paperAnalysis"
  );

const saveLiterature =
  document.getElementById(
    "saveLiterature"
  );

let currentAnalysis = null;
let currentMeta = null;

let selectedLiteratureIds =
  [];

let comparedLiteratureIds =
  [];

let literatureSelectionMessage =
  "";

uploadButton
  ?.addEventListener(
    "click",
    () => {
      pdfInput?.click();
    }
  );

pdfInput
  ?.addEventListener(
    "change",
    () => {
      const file =
        pdfInput.files?.[0];

      if (!file) return;

      const sizeMB =
        (
          file.size /
          1024 /
          1024
        ).toFixed(2);

      if (fileInfo) {
        fileInfo.textContent =
          `📄 ${file.name} · ${sizeMB} MB`;
      }

      if (analyzeButton) {
        analyzeButton.hidden =
          false;

        analyzeButton.disabled =
          false;

        analyzeButton.textContent =
          "✦ AI ile Analiz Et";
      }

      if (resultBox) {
        resultBox.hidden =
          true;
      }

      if (statusBox) {
        statusBox.hidden =
          true;

        statusBox.textContent =
          "";
      }

      currentAnalysis =
        null;

      currentMeta =
        null;
    }
  );

// =====================================================
// PDF ANALİZİ
// =====================================================

analyzeButton
  ?.addEventListener(
    "click",
    async () => {
      const file =
        pdfInput?.files?.[0];

      if (!file) return;

      analyzeButton.disabled =
        true;

      analyzeButton.textContent =
        "Analiz ediliyor…";

      if (statusBox) {
        statusBox.hidden =
          false;

        statusBox.className =
          "status loading";

        statusBox.textContent =
          "PDF okunuyor. Academic AI belgenin akademik yapısını ve kanıtlarını analiz ediyor...";
      }

      try {
        const formData =
          new FormData();

        formData.append(
          "pdf",
          file
        );

        const response =
          await fetch(
            "/api/analyze",
            {
              method: "POST",
              body: formData
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "Academic AI sunucusundan geçerli bir yanıt alınamadı."
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            cleanPublicErrorMessage(
              data.message ||
                "Analiz tamamlanamadı."
            )
          );
        }

        currentAnalysis =
          data.analysis;

        currentMeta =
          data.meta || null;

        renderAnalysis(
          currentAnalysis,
          file.name
        );

        if (statusBox) {
          statusBox.className =
            "status success";

          if (
            currentMeta?.truncated
          ) {
            statusBox.textContent =
              "✓ Analiz tamamlandı. Belgenin boyutu sistem sınırını aştığı için bazı bölümler analize dahil edilememiş olabilir.";
          } else if (
            currentMeta?.chunked &&
            currentMeta?.chunkCount
          ) {
            statusBox.textContent =
              `✓ Analiz tamamlandı. Belgenin tamamı ${currentMeta.chunkCount} bölüm halinde incelendi ve sonuçlar birleştirildi.`;
          } else {
            statusBox.textContent =
              "✓ Analiz tamamlandı. Akademik bilgiler ve kanıt türleri ayrıştırıldı.";
          }
        }
      } catch (error) {
        console.error(
          "Academic AI analiz hatası:",
          error
        );

        if (statusBox) {
          statusBox.className =
            "status error";

          statusBox.textContent =
            "Analiz yapılamadı: " +
            cleanPublicErrorMessage(
              error.message
            );
        }
      } finally {
        analyzeButton.disabled =
          false;

        analyzeButton.textContent =
          "✦ AI ile Analiz Et";
      }
    }
  );

// =====================================================
// HATA MESAJLARI
// =====================================================

function cleanPublicErrorMessage(
  message
) {
  if (!message) {
    return "Beklenmeyen bir hata oluştu.";
  }

  let cleaned =
    String(message)
      .replace(
        /Anthropic/gi,
        "Academic AI"
      )
      .replace(
        /Claude/gi,
        "Academic AI"
      )
      .replace(
        /claude-[a-zA-Z0-9.-]+/gi,
        "AI modeli"
      );

  if (
    cleaned
      .toLowerCase()
      .includes("json") ||
    cleaned
      .toLowerCase()
      .includes(
        "biçimi bozuk"
      )
  ) {
    return (
      "Analiz sırasında geçici bir biçimlendirme sorunu oluştu. " +
      "Lütfen analizi yeniden deneyin."
    );
  }

  if (
    cleaned
      .toLowerCase()
      .includes(
        "authentication"
      ) ||
    cleaned
      .toLowerCase()
      .includes(
        "api key"
      ) ||
    cleaned
      .toLowerCase()
      .includes(
        "api anahtarı"
      )
  ) {
    return "Academic AI bağlantısı doğrulanamadı.";
  }

  if (
    cleaned.includes("429") ||
    cleaned
      .toLowerCase()
      .includes(
        "rate limit"
      ) ||
    cleaned
      .toLowerCase()
      .includes(
        "hız sınırı"
      )
  ) {
    return "Academic AI şu anda yoğun. Lütfen daha sonra tekrar deneyin.";
  }

  return cleaned;
}
// =====================================================
// BASİT LİSTELER
// =====================================================

function renderSimpleList(
  id,
  values,
  emptyMessage
) {
  const container =
    document.getElementById(
      id
    );

  if (!container) return;

  container.innerHTML =
    "";

  const items =
    Array.isArray(values)
      ? values.filter(
          (item) =>
            typeof item ===
              "string" &&
            item.trim()
        )
      : [];

  if (!items.length) {
    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "analysis-empty";

    empty.textContent =
      emptyMessage;

    container.appendChild(
      empty
    );

    return;
  }

  const ul =
    document.createElement(
      "ul"
    );

  items.forEach((item) => {
    const li =
      document.createElement(
        "li"
      );

    li.textContent = item;

    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function renderTags(
  id,
  values
) {
  const container =
    document.getElementById(
      id
    );

  if (!container) return;

  container.innerHTML =
    "";

  const tags =
    Array.isArray(values)
      ? values.filter(
          Boolean
        )
      : [];

  if (!tags.length) {
    const span =
      document.createElement(
        "span"
      );

    span.textContent =
      "Anahtar kavram bulunamadı.";

    container.appendChild(
      span
    );

    return;
  }

  tags.forEach(
    (keyword) => {
      const span =
        document.createElement(
          "span"
        );

      span.textContent =
        keyword;

      container.appendChild(
        span
      );
    }
  );
}

// =====================================================
// KANIT ETİKETLERİ
// =====================================================

function getEvidenceBadge(
  type
) {
  if (
    type === "explicit"
  ) {
    return {
      className:
        "explicit",

      text:
        "🟢 Araştırmacı açıkça belirtmiş"
    };
  }

  if (type === "fact") {
    return {
      className:
        "fact",

      text:
        "🔵 Belgede bulunan gerçek"
    };
  }

  return {
    className:
      "inference",

    text:
      "🟠 Academic AI çıkarımı"
  };
}

// =====================================================
// KANIT KARTLARI
// =====================================================

function renderEvidenceList(
  id,
  items,
  emptyMessage,
  options = {}
) {
  const container =
    document.getElementById(
      id
    );

  if (!container) return;

  container.innerHTML =
    "";

  const normalized =
    Array.isArray(items)
      ? items.filter(
          (item) =>
            item &&
            typeof item.text ===
              "string" &&
            item.text.trim()
        )
      : [];

  if (!normalized.length) {
    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "analysis-empty";

    empty.textContent =
      emptyMessage;

    container.appendChild(
      empty
    );

    return;
  }

  normalized.forEach(
    (item) => {
      const type =
        [
          "explicit",
          "fact",
          "inference"
        ].includes(
          item.evidenceType
        )
          ? item.evidenceType
          : "fact";

      const badgeInfo =
        getEvidenceBadge(
          type
        );

      const card =
        document.createElement(
          "div"
        );

      card.className =
        `evidence-item ${badgeInfo.className}`;

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        `evidence-badge ${badgeInfo.className}`;

      badge.textContent =
        badgeInfo.text;

      card.appendChild(
        badge
      );

      const mainText =
        document.createElement(
          "p"
        );

      mainText.className =
        "evidence-main";

      mainText.textContent =
        cleanValue(
          item.text
        );

      card.appendChild(
        mainText
      );

      if (
        item.evidence
      ) {
        const evidenceBox =
          document.createElement(
            "div"
          );

        evidenceBox.className =
          "evidence-quote";

        const label =
          document.createElement(
            "strong"
          );

        label.textContent =
          type ===
          "inference"
            ? "Dayandığı belge bilgisi"
            : "Kanıt";

        const evidenceText =
          document.createElement(
            "p"
          );

        evidenceText.textContent =
          cleanValue(
            item.evidence
          );

        evidenceBox.appendChild(
          label
        );

        evidenceBox.appendChild(
          evidenceText
        );

        card.appendChild(
          evidenceBox
        );
      }

      if (
        item.sourceSection
      ) {
        const source =
          document.createElement(
            "small"
          );

        source.className =
          "evidence-source";

        source.textContent =
          "Kaynak bölüm: " +
          cleanValue(
            item.sourceSection
          );

        card.appendChild(
          source
        );
      }

      if (
        type === "fact" &&
        options.factWarning
      ) {
        const warning =
          document.createElement(
            "small"
          );

        warning.className =
          "evidence-warning";

        warning.textContent =
          "Bu bilgi belgede yer alıyor; ancak araştırmacı bunu doğrudan bir sınırlılık olarak tanımlamıyor.";

        card.appendChild(
          warning
        );
      }

      if (
        type ===
          "inference" &&
        options
          .inferenceWarning
      ) {
        const warning =
          document.createElement(
            "small"
          );

        warning.className =
          "evidence-warning";

        warning.textContent =
          "Bu değerlendirme Academic AI tarafından belge içeriğine dayanılarak oluşturulmuştur.";

        card.appendChild(
          warning
        );
      }

      container.appendChild(
        card
      );
    }
  );
}

// =====================================================
// TEK BELGE ANALİZİ
// =====================================================

function renderAnalysis(
  analysis,
  fileName
) {
  if (!analysis) return;

  const title =
    analysis.title ||
    fileName.replace(
      /\.pdf$/i,
      ""
    );

  setText(
    "analysisTitle",
    title,
    "Akademik belge analizi"
  );

  setText(
    "analysisPurpose",
    analysis.purpose
  );

  setText(
    "analysisResearchProblem",
    analysis.researchProblem,
    "Araştırma problemi veya araştırma sorusu açık biçimde belirlenemedi."
  );

  setText(
    "analysisMethod",
    analysis.method
  );

  setText(
    "analysisResearchDesign",
    analysis.researchDesign,
    "Araştırma deseni açık biçimde belirtilmemiş."
  );

  setText(
    "analysisPopulation",
    analysis.population,
    "Araştırmanın evreni açık biçimde belirtilmemiş."
  );

  setText(
    "analysisSample",
    analysis.sample,
    "Örneklem veya çalışma grubu açık biçimde belirlenemedi."
  );

  setText(
    "analysisDataCollection",
    analysis.dataCollection,
    "Veri toplama yöntemi açık biçimde belirlenemedi."
  );

  setText(
    "analysisDataAnalysis",
    analysis.dataAnalysis,
    "Veri analiz yöntemi açık biçimde belirlenemedi."
  );

  setText(
    "analysisSummary",
    analysis.summary,
    "Ayrıntılı özet oluşturulamadı."
  );

  if (
    Array.isArray(
      analysis.findingEvidence
    ) &&
    analysis.findingEvidence
      .length
  ) {
    renderEvidenceList(
      "analysisFindings",
      analysis.findingEvidence,
      "Araştırmanın temel bulguları belirlenemedi."
    );
  } else {
    renderSimpleList(
      "analysisFindings",
      analysis.findings,
      "Araştırmanın temel bulguları belirlenemedi."
    );
  }

  renderSimpleList(
    "analysisConclusions",
    analysis.conclusions,
    "Araştırmanın sonuçları açık biçimde belirlenemedi."
  );

  renderEvidenceList(
    "analysisLimitations",
    analysis.limitationEvidence,
    "PDF metninde sınırlılıkla ilişkili güvenilir bir bilgi bulunamadı.",
    {
      factWarning: true,
      inferenceWarning:
        true
    }
  );

  if (
    Array.isArray(
      analysis
        .recommendationEvidence
    ) &&
    analysis
      .recommendationEvidence
      .length
  ) {
    renderEvidenceList(
      "analysisRecommendations",
      analysis
        .recommendationEvidence,
      "PDF metninde araştırmacının açıkça belirtilmiş önerileri bulunamadı.",
      {
        factWarning: true,
        inferenceWarning:
          true
      }
    );
  } else {
    renderSimpleList(
      "analysisRecommendations",
      analysis.recommendations,
      "PDF metninde araştırmacının açıkça belirtilmiş önerileri bulunamadı."
    );
  }

  setText(
    "analysisContribution",
    analysis.contribution,
    "Araştırmanın akademik katkısı metinden açık biçimde belirlenemedi."
  );

  renderTags(
    "analysisKeywords",
    analysis.keywords
  );

  if (resultBox) {
    resultBox.hidden =
      false;

    resultBox.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// =====================================================
// LİTERATÜR DEPOLAMA
// =====================================================

function getLibrary() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "academicAILibrary"
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function setLibrary(value) {
  localStorage.setItem(
    "academicAILibrary",
    JSON.stringify(value)
  );

  cleanupLiteratureSelection(
    value
  );

  renderLibrary();

  renderLiteratureAnalysis();

  updateAssistantSourceStatus();
}

// =====================================================
// LİTERATÜR SEÇİM DURUMU
// =====================================================

function cleanupLiteratureSelection(
  library
) {
  const validIds =
    new Set(
      library.map((item) =>
        getItemId(item)
      )
    );

  selectedLiteratureIds =
    selectedLiteratureIds.filter(
      (id) =>
        validIds.has(
          String(id)
        )
    );

  comparedLiteratureIds =
    comparedLiteratureIds.filter(
      (id) =>
        validIds.has(
          String(id)
        )
    );

  saveLiteratureSelection();
}

function saveLiteratureSelection() {
  try {
    localStorage.setItem(
      "academicAISelectedLiterature",
      JSON.stringify(
        selectedLiteratureIds
      )
    );

    localStorage.setItem(
      "academicAIComparedLiterature",
      JSON.stringify(
        comparedLiteratureIds
      )
    );
  } catch {
    // uygulamayı durdurma
  }
}

function loadLiteratureSelection() {
  const library =
    getLibrary();

  const allIds =
    library.map((item) =>
      getItemId(item)
    );

  try {
    const storedSelected =
      JSON.parse(
        localStorage.getItem(
          "academicAISelectedLiterature"
        ) || "[]"
      );

    const storedCompared =
      JSON.parse(
        localStorage.getItem(
          "academicAIComparedLiterature"
        ) || "[]"
      );

    if (
      Array.isArray(
        storedSelected
      )
    ) {
      selectedLiteratureIds =
        storedSelected.map(
          String
        );
    }

    if (
      Array.isArray(
        storedCompared
      )
    ) {
      comparedLiteratureIds =
        storedCompared.map(
          String
        );
    }
  } catch {
    selectedLiteratureIds =
      [];

    comparedLiteratureIds =
      [];
  }

  const validIdSet =
    new Set(allIds);

  selectedLiteratureIds =
    selectedLiteratureIds.filter(
      (id) =>
        validIdSet.has(id)
    );

  comparedLiteratureIds =
    comparedLiteratureIds.filter(
      (id) =>
        validIdSet.has(id)
    );

  if (
    library.length >= 2 &&
    selectedLiteratureIds
      .length === 0 &&
    comparedLiteratureIds
      .length === 0
  ) {
    selectedLiteratureIds = [
      ...allIds
    ];

    comparedLiteratureIds = [
      ...allIds
    ];

    saveLiteratureSelection();
  }
}

// =====================================================
// LİTERATÜRE KAYDET
// =====================================================

saveLiterature
  ?.addEventListener(
    "click",
    () => {
      if (
        !currentAnalysis
      ) {
        return;
      }

      const library =
        getLibrary();

      const record = {
        ...currentAnalysis,

        id:
          Date.now(),

        fileName:
          pdfInput
            ?.files
            ?.[0]
            ?.name ||
          "PDF",

        savedAt:
          new Date()
            .toISOString(),

        meta:
          currentMeta
      };

      library.unshift(
        record
      );

      setLibrary(
        library
      );

      saveLiterature.textContent =
        "✓ Literatüre Kaydedildi";

      setTimeout(() => {
        saveLiterature.textContent =
          "＋ Literatürüme Kaydet";
      }, 1600);
    }
  );

// =====================================================
// LİTERATÜRÜM
// =====================================================

let literatureSearchQuery = "";
let literatureMethodFilterValue = "all";
let literatureSortValue = "newest";
let visibleLiteratureIds = [];

function getLiteratureSearchHaystack(item) {
  const findings = Array.isArray(item?.findings)
    ? item.findings.join(" ")
    : "";

  const keywords = Array.isArray(item?.keywords)
    ? item.keywords.join(" ")
    : "";

  return normalizeSearchText([
    item?.title,
    item?.fileName,
    item?.purpose,
    item?.researchProblem,
    item?.method,
    item?.researchDesign,
    item?.population,
    item?.sample,
    item?.dataCollection,
    item?.dataAnalysis,
    item?.summary,
    findings,
    keywords,
    item?.contribution
  ].filter(Boolean).join(" "));
}

function getFilteredLiterature(library) {
  const query = normalizeSearchText(
    literatureSearchQuery
  );

  const filtered = library.filter(
    (item) => {
      const method = normalizeMethodName(
        item
      );

      const methodMatches =
        literatureMethodFilterValue === "all" ||
        method === literatureMethodFilterValue;

      const queryMatches =
        !query ||
        getLiteratureSearchHaystack(
          item
        ).includes(query);

      return methodMatches && queryMatches;
    }
  );

  return filtered.sort((a, b) => {
    if (literatureSortValue === "title") {
      return String(
        a?.title || a?.fileName || ""
      ).localeCompare(
        String(b?.title || b?.fileName || ""),
        "tr"
      );
    }

    const aTime = Number(
      a?.savedAt || a?.id || 0
    );
    const bTime = Number(
      b?.savedAt || b?.id || 0
    );

    return literatureSortValue === "oldest"
      ? aTime - bTime
      : bTime - aTime;
  });
}

function updateLiteratureSelectionBar(
  visibleLibrary = []
) {
  const visibleCount =
    document.getElementById(
      "literatureVisibleCount"
    );

  const selectedCount =
    document.getElementById(
      "literatureSelectedCount"
    );

  const analyzeButton =
    document.getElementById(
      "analyzeSelectedLiterature"
    );

  if (visibleCount) {
    visibleCount.textContent =
      `${visibleLibrary.length} kaynak`;
  }

  if (selectedCount) {
    selectedCount.textContent =
      `${selectedLiteratureIds.length} seçili`;
  }

  if (analyzeButton) {
    analyzeButton.disabled =
      selectedLiteratureIds.length < 2;

    analyzeButton.title =
      selectedLiteratureIds.length < 2
        ? "Karşılaştırma için en az iki kaynak seç."
        : "Seçili kaynakları Literatür Analizi'nde karşılaştır.";
  }
}

function makeLiteratureMetaItem(
  label,
  value
) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "library-meta-item";

  const labelElement =
    document.createElement("span");

  labelElement.textContent = label;

  const valueElement =
    document.createElement("strong");

  valueElement.textContent =
    cleanValue(value) || "Belirlenemedi";

  wrapper.appendChild(labelElement);
  wrapper.appendChild(valueElement);

  return wrapper;
}

function createLiteratureFindingPreview(
  item
) {
  const findings = Array.isArray(
    item?.findings
  )
    ? item.findings.filter(Boolean)
    : [];

  if (!findings.length) {
    return null;
  }

  const box =
    document.createElement("div");

  box.className =
    "library-finding-preview";

  const label =
    document.createElement("span");

  label.textContent =
    "ÖNE ÇIKAN BULGU";

  const text =
    document.createElement("p");

  text.textContent =
    shorten(findings[0], 230);

  box.appendChild(label);
  box.appendChild(text);

  return box;
}

function appendDetailSection(
  container,
  title,
  value
) {
  const values = Array.isArray(value)
    ? value.filter(Boolean)
    : cleanValue(value)
      ? [cleanValue(value)]
      : [];

  const section =
    document.createElement("section");

  section.className =
    "literature-detail-section";

  const heading =
    document.createElement("h3");

  heading.textContent = title;
  section.appendChild(heading);

  if (!values.length) {
    const empty =
      document.createElement("p");

    empty.className =
      "literature-detail-muted";

    empty.textContent =
      "Bu bilgi mevcut analiz kaydında belirlenemedi.";

    section.appendChild(empty);
  } else if (values.length === 1) {
    const paragraph =
      document.createElement("p");

    paragraph.textContent = values[0];
    section.appendChild(paragraph);
  } else {
    const list =
      document.createElement("ul");

    values.forEach((entry) => {
      const li =
        document.createElement("li");

      li.textContent = entry;
      list.appendChild(li);
    });

    section.appendChild(list);
  }

  container.appendChild(section);
}

function openLiteratureDetail(item) {
  const overlay =
    document.getElementById(
      "literatureDetailOverlay"
    );

  const title =
    document.getElementById(
      "literatureDetailTitle"
    );

  const content =
    document.getElementById(
      "literatureDetailContent"
    );

  if (!overlay || !title || !content) {
    return;
  }

  title.textContent =
    item?.title ||
    item?.fileName ||
    "Başlıksız çalışma";

  content.innerHTML = "";

  const meta =
    document.createElement("div");

  meta.className =
    "literature-detail-meta";

  meta.appendChild(
    makeLiteratureMetaItem(
      "Yöntem",
      normalizeMethodName(item)
    )
  );

  meta.appendChild(
    makeLiteratureMetaItem(
      "Araştırma deseni",
      item?.researchDesign
    )
  );

  meta.appendChild(
    makeLiteratureMetaItem(
      "Örneklem",
      item?.sample
    )
  );

  content.appendChild(meta);

  appendDetailSection(
    content,
    "Araştırmanın amacı",
    item?.purpose
  );

  appendDetailSection(
    content,
    "Araştırma problemi / sorusu",
    item?.researchProblem
  );

  appendDetailSection(
    content,
    "Ayrıntılı özet",
    item?.summary
  );

  appendDetailSection(
    content,
    "Önemli bulgular",
    item?.findings
  );

  appendDetailSection(
    content,
    "Araştırmanın sonuçları",
    item?.conclusions
  );

  const limitations = Array.isArray(
    item?.limitationEvidence
  )
    ? item.limitationEvidence
        .map((entry) => entry?.text)
        .filter(Boolean)
    : [];

  appendDetailSection(
    content,
    "Araştırmanın sınırlılıkları",
    limitations
  );

  appendDetailSection(
    content,
    "Araştırmacının önerileri",
    item?.recommendations
  );

  appendDetailSection(
    content,
    "Akademik katkı",
    item?.contribution
  );

  const thesisSuggestions =
    buildThesisUseSuggestions(item)
      .map(
        (suggestion) =>
          `${suggestion.section}: ${suggestion.text}`
      );

  appendDetailSection(
    content,
    "Tezimde nasıl kullanırım?",
    thesisSuggestions
  );

  if (
    Array.isArray(item?.keywords) &&
    item.keywords.length
  ) {
    const keywordSection =
      document.createElement("section");

    keywordSection.className =
      "literature-detail-section";

    const heading =
      document.createElement("h3");

    heading.textContent =
      "Anahtar kavramlar";

    const tags =
      document.createElement("div");

    tags.className = "tags";

    item.keywords.forEach(
      (keyword) => {
        const tag =
          document.createElement("span");

        tag.textContent = keyword;
        tags.appendChild(tag);
      }
    );

    keywordSection.appendChild(heading);
    keywordSection.appendChild(tags);
    content.appendChild(keywordSection);
  }

  overlay.hidden = false;
  document.body.classList.add(
    "modal-open"
  );
}

function closeLiteratureDetailPanel() {
  const overlay =
    document.getElementById(
      "literatureDetailOverlay"
    );

  if (overlay) {
    overlay.hidden = true;
  }

  document.body.classList.remove(
    "modal-open"
  );
}

function renderLibrary() {
  const library = getLibrary();

  const section =
    document.getElementById(
      "literature"
    );

  if (!section) return;

  const oldList =
    section.querySelector(
      ".library-list"
    );

  if (oldList) {
    oldList.remove();
  }

  const empty =
    document.getElementById(
      "literatureList"
    );

  const noResults =
    document.getElementById(
      "literatureNoResults"
    );

  const toolbar =
    document.getElementById(
      "literatureToolbar"
    );

  if (!library.length) {
    if (empty) empty.style.display = "block";
    if (toolbar) toolbar.style.display = "none";
    if (noResults) noResults.hidden = true;
    visibleLiteratureIds = [];
  } else {
    if (empty) empty.style.display = "none";
    if (toolbar) toolbar.style.display = "grid";

    const visibleLibrary =
      getFilteredLiterature(library);

    visibleLiteratureIds =
      visibleLibrary.map(
        (item) => getItemId(item)
      );

    if (noResults) {
      noResults.hidden =
        visibleLibrary.length !== 0;
    }

    const list =
      document.createElement("div");

    list.className = "library-list";

    visibleLibrary.forEach((item) => {
      const itemId = getItemId(item);

      const card =
        document.createElement("article");

      card.className = "library-card";

      if (
        selectedLiteratureIds.includes(
          itemId
        )
      ) {
        card.classList.add("selected");
      }

      const selector =
        document.createElement("label");

      selector.className =
        "library-select-box";

      const checkbox =
        document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.checked =
        selectedLiteratureIds.includes(
          itemId
        );

      const checkText =
        document.createElement("span");

      checkText.textContent =
        "Analiz için seç";

      selector.appendChild(checkbox);
      selector.appendChild(checkText);

      checkbox.addEventListener(
        "change",
        () => {
          if (checkbox.checked) {
            if (
              !selectedLiteratureIds.includes(
                itemId
              )
            ) {
              selectedLiteratureIds.push(
                itemId
              );
            }
          } else {
            selectedLiteratureIds =
              selectedLiteratureIds.filter(
                (id) => id !== itemId
              );
          }

          saveLiteratureSelection();
          renderLibrary();
          updateAssistantSourceStatus();
        }
      );

      const content =
        document.createElement("div");

      content.className =
        "library-card-content";

      const top =
        document.createElement("div");

      top.className =
        "library-card-top";

      const titleWrap =
        document.createElement("div");

      const eyebrow =
        document.createElement("span");

      eyebrow.className = "eyebrow";
      eyebrow.textContent =
        "KAYDEDİLEN AKADEMİK ÇALIŞMA";

      const title =
        document.createElement("h3");

      title.textContent =
        item.title ||
        item.fileName ||
        "Başlıksız çalışma";

      titleWrap.appendChild(eyebrow);
      titleWrap.appendChild(title);
      top.appendChild(titleWrap);
      top.appendChild(selector);

      const summary =
        document.createElement("p");

      summary.className = "lib-summary";
      summary.textContent =
        shorten(
          item.summary || item.purpose || "",
          360
        );

      const meta =
        document.createElement("div");

      meta.className =
        "library-meta-grid";

      meta.appendChild(
        makeLiteratureMetaItem(
          "Yöntem",
          normalizeMethodName(item)
        )
      );

      meta.appendChild(
        makeLiteratureMetaItem(
          "Araştırma deseni",
          item.researchDesign
        )
      );

      meta.appendChild(
        makeLiteratureMetaItem(
          "Örneklem / grup",
          item.sample
        )
      );

      const findingPreview =
        createLiteratureFindingPreview(
          item
        );

      const tags =
        document.createElement("div");

      tags.className = "tags";

      (item.keywords || [])
        .slice(0, 6)
        .forEach((keyword) => {
          const tag =
            document.createElement("span");

          tag.textContent = keyword;
          tags.appendChild(tag);
        });

      const actions =
        document.createElement("div");

      actions.className =
        "library-card-actions";

      const detailButton =
        document.createElement("button");

      detailButton.className =
        "secondary-button";
      detailButton.type = "button";
      detailButton.textContent =
        "Ayrıntıları gör";

      detailButton.addEventListener(
        "click",
        () => openLiteratureDetail(item)
      );

      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "delete-source";
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.title = "Kaynağı sil";

      deleteButton.addEventListener(
        "click",
        () => {
          const confirmed = window.confirm(
            "Bu kaynağı Literatürüm'den silmek istiyor musun?"
          );

          if (!confirmed) return;

          const updated = getLibrary()
            .filter(
              (source) =>
                getItemId(source) !== itemId
            );

          setLibrary(updated);
        }
      );

      actions.appendChild(detailButton);
      actions.appendChild(deleteButton);

      content.appendChild(top);
      content.appendChild(summary);
      content.appendChild(meta);

      if (findingPreview) {
        content.appendChild(
          findingPreview
        );
      }

      content.appendChild(tags);
      content.appendChild(actions);
      card.appendChild(content);
      list.appendChild(card);
    });

    section.appendChild(list);
    updateLiteratureSelectionBar(
      visibleLibrary
    );
  }

  const literatureCount =
    document.getElementById(
      "literatureCount"
    );

  const paperCount =
    document.getElementById(
      "paperCount"
    );

  if (literatureCount) {
    literatureCount.textContent =
      library.length;
  }

  if (paperCount) {
    paperCount.textContent =
      library.length;
  }
}

const literatureSearchInput =
  document.getElementById(
    "literatureSearchInput"
  );

const literatureMethodFilter =
  document.getElementById(
    "literatureMethodFilter"
  );

const literatureSort =
  document.getElementById(
    "literatureSort"
  );

literatureSearchInput
  ?.addEventListener("input", () => {
    literatureSearchQuery =
      literatureSearchInput.value;
    renderLibrary();
  });

literatureMethodFilter
  ?.addEventListener("change", () => {
    literatureMethodFilterValue =
      literatureMethodFilter.value;
    renderLibrary();
  });

literatureSort
  ?.addEventListener("change", () => {
    literatureSortValue =
      literatureSort.value;
    renderLibrary();
  });

document
  .getElementById(
    "selectAllVisibleLiterature"
  )
  ?.addEventListener("click", () => {
    selectedLiteratureIds = [
      ...new Set([
        ...selectedLiteratureIds,
        ...visibleLiteratureIds
      ])
    ];

    saveLiteratureSelection();
    renderLibrary();
    updateAssistantSourceStatus();
  });

document
  .getElementById(
    "clearLiteratureSelection"
  )
  ?.addEventListener("click", () => {
    selectedLiteratureIds = [];
    saveLiteratureSelection();
    renderLibrary();
    updateAssistantSourceStatus();
  });

document
  .getElementById(
    "analyzeSelectedLiterature"
  )
  ?.addEventListener("click", () => {
    if (
      selectedLiteratureIds.length < 2
    ) {
      return;
    }

    comparedLiteratureIds = [
      ...selectedLiteratureIds
    ];

    literatureSelectionMessage =
      `${comparedLiteratureIds.length} kaynak Literatürüm ekranından karşılaştırma için seçildi.`;

    saveLiteratureSelection();
    go("analysis");
    renderLiteratureAnalysis();
  });

document
  .getElementById(
    "closeLiteratureDetail"
  )
  ?.addEventListener(
    "click",
    closeLiteratureDetailPanel
  );

document
  .getElementById(
    "literatureDetailOverlay"
  )
  ?.addEventListener("click", (event) => {
    if (
      event.target.id ===
      "literatureDetailOverlay"
    ) {
      closeLiteratureDetailPanel();
    }
  });

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      closeLiteratureDetailPanel();
    }
  }
);
// =====================================================
// YÖNTEM NORMALİZASYONU
// =====================================================

function normalizeMethodName(
  item
) {
  const design =
    cleanValue(
      item.researchDesign
    );

  const method =
    cleanValue(
      item.method
    );

  const source =
    `${design} ${method}`
      .toLowerCase();

  if (
    source.includes(
      "nitel"
    )
  ) {
    return "Nitel";
  }

  if (
    source.includes(
      "nicel"
    )
  ) {
    return "Nicel";
  }

  if (
    source.includes(
      "karma"
    )
  ) {
    return "Karma";
  }

  if (
    source.includes(
      "deney"
    )
  ) {
    return "Deneysel";
  }

  if (
    source.includes(
      "tarama"
    )
  ) {
    return "Tarama";
  }

  if (design) {
    return shorten(
      design,
      60
    );
  }

  if (method) {
    return shorten(
      method,
      60
    );
  }

  return "Belirtilmemiş";
}

// =====================================================
// ANAHTAR KELİMELER
// =====================================================

function getKeywordStatistics(
  library
) {
  const counts = {};

  library.forEach(
    (item) => {
      const uniqueKeywords =
        new Set(
          (
            item.keywords ||
            []
          )
            .map(
              (keyword) =>
                String(
                  keyword
                )
                  .trim()
                  .toLocaleLowerCase(
                    "tr-TR"
                  )
            )
            .filter(Boolean)
        );

      uniqueKeywords.forEach(
        (keyword) => {
          counts[keyword] =
            (
              counts[
                keyword
              ] || 0
            ) + 1;
        }
      );
    }
  );

  return counts;
}

function getDisplayKeyword(
  keyword,
  library
) {
  for (
    const item of library
  ) {
    const found =
      (
        item.keywords ||
        []
      ).find(
        (value) =>
          String(value)
            .trim()
            .toLocaleLowerCase(
              "tr-TR"
            ) === keyword
      );

    if (found) {
      return found;
    }
  }

  return keyword;
}

// =====================================================
// BULGU TOPLAMA
// =====================================================

function getStudyFindings(
  item
) {
  if (
    Array.isArray(
      item.findingEvidence
    ) &&
    item.findingEvidence
      .length
  ) {
    return item
      .findingEvidence
      .map(
        (finding) =>
          finding?.text
      )
      .filter(Boolean);
  }

  if (
    Array.isArray(
      item.findings
    )
  ) {
    return item.findings
      .filter(Boolean);
  }

  return [];
}

// =====================================================
// BULGU BENZERLİĞİ
// =====================================================

const findingStopWords =
  new Set([
    "ve",
    "ile",
    "bir",
    "bu",
    "da",
    "de",
    "için",
    "olarak",
    "olan",
    "olduğu",
    "ise",
    "daha",
    "çok",
    "gibi",
    "göre",
    "üzerinde",
    "üzerine",
    "araştırma",
    "çalışma",
    "çalışmada",
    "katılımcılar",
    "katılımcıların",
    "bulgular",
    "sonuçlar"
  ]);

function getFindingWords(
  text
) {
  return new Set(
    normalizeSearchText(
      text
    )
      .split(" ")
      .filter(
        (word) =>
          word.length >= 4 &&
          !findingStopWords.has(
            word
          )
      )
  );
}

function calculateFindingSimilarity(
  first,
  second
) {
  const a =
    getFindingWords(
      first
    );

  const b =
    getFindingWords(
      second
    );

  if (
    !a.size ||
    !b.size
  ) {
    return 0;
  }

  let intersection = 0;

  a.forEach(
    (word) => {
      if (b.has(word)) {
        intersection++;
      }
    }
  );

  const smaller =
    Math.min(
      a.size,
      b.size
    );

  return (
    intersection /
    smaller
  );
}

function findCommonFindings(
  library
) {
  const matches = [];
  const seen =
    new Set();

  for (
    let i = 0;
    i < library.length;
    i++
  ) {
    const findingsA =
      getStudyFindings(
        library[i]
      );

    for (
      let j = i + 1;
      j < library.length;
      j++
    ) {
      const findingsB =
        getStudyFindings(
          library[j]
        );

      for (
        const findingA of
        findingsA
      ) {
        for (
          const findingB of
          findingsB
        ) {
          const similarity =
            calculateFindingSimilarity(
              findingA,
              findingB
            );

          if (
            similarity >=
            0.34
          ) {
            const key =
              [
                normalizeSearchText(
                  findingA
                ),
                normalizeSearchText(
                  findingB
                )
              ]
                .sort()
                .join("|");

            if (
              seen.has(key)
            ) {
              continue;
            }

            seen.add(key);

            matches.push({
              sourceA:
                library[i],

              sourceB:
                library[j],

              findingA,
              findingB,
              similarity
            });
          }
        }
      }
    }
  }

  return matches
    .sort(
      (a, b) =>
        b.similarity -
        a.similarity
    )
    .slice(0, 10);
}

function findDifferentFindings(
  library,
  commonMatches
) {
  const commonTexts =
    new Set();

  commonMatches.forEach(
    (match) => {
      commonTexts.add(
        normalizeSearchText(
          match.findingA
        )
      );

      commonTexts.add(
        normalizeSearchText(
          match.findingB
        )
      );
    }
  );

  const results = [];

  library.forEach(
    (item) => {
      const findings =
        getStudyFindings(
          item
        );

      findings.forEach(
        (finding) => {
          const normalized =
            normalizeSearchText(
              finding
            );

          if (
            !commonTexts.has(
              normalized
            )
          ) {
            results.push({
              source:
                item,

              finding
            });
          }
        }
      );
    }
  );

  return results.slice(
    0,
    12
  );
}

// =====================================================
// İLERİ ANALİZ KARTLARI
// =====================================================

function ensureAdvancedLiteratureSections(
  content
) {
  if (
    !document.getElementById(
      "commonFindingsCard"
    )
  ) {
    const commonCard =
      document.createElement(
        "article"
      );

    commonCard.id =
      "commonFindingsCard";

    commonCard.className =
      "analysis-insight-card wide-analysis-card";

    commonCard.innerHTML = `
      <span class="eyebrow">
        ORTAK BULGULAR
      </span>

      <h3>
        Araştırmaların benzer sonuçlara işaret ettiği noktalar
      </h3>

      <p class="analysis-help">
        Bu bölüm seçilen çalışmaların kayıtlı bulgularındaki
        kelime ve kavram benzerliklerini karşılaştırır.
        Yeni bir AI çağrısı yapılmaz.
      </p>

      <div
        id="commonFindingsList"
        class="finding-pool"
      ></div>
    `;

    content.appendChild(
      commonCard
    );
  }

  if (
    !document.getElementById(
      "differentFindingsCard"
    )
  ) {
    const differentCard =
      document.createElement(
        "article"
      );

    differentCard.id =
      "differentFindingsCard";

    differentCard.className =
      "analysis-insight-card wide-analysis-card";

    differentCard.innerHTML = `
      <span class="eyebrow">
        FARKLILAŞAN BULGULAR
      </span>

      <h3>
        Araştırmaların farklı yönlere işaret ettiği noktalar
      </h3>

      <p class="analysis-help">
        Buradaki maddeler otomatik olarak akademik çelişki kabul edilmez.
        Sistem yalnızca diğer seçili kaynaklarda yakın bir eşleşme bulunmayan
        bulguları ayırır.
      </p>

      <div
        id="differentFindingsList"
        class="finding-pool"
      ></div>
    `;

            content.appendChild(
      differentCard
    );
  }
      if (
    !document.getElementById(
      "synthesisOverviewCard"
    )
  ) {
    const synthesisCard =
      document.createElement(
        "article"
      );

    synthesisCard.id =
      "synthesisOverviewCard";

    synthesisCard.className =
      "analysis-insight-card wide-analysis-card";

    synthesisCard.innerHTML = `
      <span class="eyebrow">
        AKILLI LİTERATÜR SENTEZİ V2
      </span>

      <h3>
        Seçili çalışmaların genel resmi
      </h3>

      <p class="analysis-help">
        Bu özet yalnızca Literatürüm'e daha önce kaydedilmiş
        analiz alanlarını karşılaştırır. Yeni AI çağrısı yapılmaz.
        Eksik veri varsa kesin sonuç yerine uyarı üretir.
      </p>

      <div
        id="synthesisOverviewList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      synthesisCard
    );
  }

  if (
    !document.getElementById(
      "evidenceStrengthCard"
    )
  ) {
    const evidenceCard =
      document.createElement(
        "article"
      );

    evidenceCard.id =
      "evidenceStrengthCard";

    evidenceCard.className =
      "analysis-insight-card wide-analysis-card";

    evidenceCard.innerHTML = `
      <span class="eyebrow">
        KANIT KAPSAMI
      </span>

      <h3>
        Hangi kaynakların karşılaştırma verisi daha dolu?
      </h3>

      <p class="analysis-help">
        Bu puan çalışmanın bilimsel kalitesini ölçmez. Yalnızca
        Academic AI kaydında yöntem, örneklem, bulgu ve kanıt
        alanlarının ne kadar dolu olduğunu gösterir.
      </p>

      <div
        id="evidenceStrengthList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      evidenceCard
    );
  }

  if (
    !document.getElementById(
      "methodFindingRelationCard"
    )
  ) {
    const relationCard =
      document.createElement(
        "article"
      );

    relationCard.id =
      "methodFindingRelationCard";

    relationCard.className =
      "analysis-insight-card wide-analysis-card";

    relationCard.innerHTML = `
      <span class="eyebrow">
        YÖNTEM × BULGU HARİTASI
      </span>

      <h3>
        Farklı yöntem grupları hangi bulguları öne çıkarıyor?
      </h3>

      <p class="analysis-help">
        Bu görünüm nedensellik kurmaz. Aynı yöntem grubundaki
        çalışmaların kayıtlı bulgularını yan yana getirerek
        araştırmacının yöntemsel örüntüleri incelemesini kolaylaştırır.
      </p>

      <div
        id="methodFindingRelationList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      relationCard
    );
  }

  if (
    !document.getElementById(
      "researchOpportunityCard"
    )
  ) {
    const opportunityCard =
      document.createElement(
        "article"
      );

    opportunityCard.id =
      "researchOpportunityCard";

    opportunityCard.className =
      "analysis-insight-card wide-analysis-card";

    opportunityCard.innerHTML = `
      <span class="eyebrow">
        ÖZGÜN ARAŞTIRMA FIRSATLARI
      </span>

      <h3>
        Buradan hangi yeni çalışmalar üretilebilir?
      </h3>

      <p class="analysis-help">
        Bunlar kesin literatür boşluğu iddiaları değildir. Seçili
        kaynakların yöntem, örneklem, coğrafya, sınırlılık, öneri
        ve farklılaşan bulgularına dayalı araştırma fırsatı sinyalleridir.
      </p>

      <div
        id="researchOpportunityList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      opportunityCard
    );
  }
  if (
  !document.getElementById(
    "thesisUseCard"
  )
) {
    const thesisUseCard =
      document.createElement(
        "article"
      );

    thesisUseCard.id =
      "thesisUseCard";

    thesisUseCard.className =
      "analysis-insight-card wide-analysis-card";

    thesisUseCard.innerHTML = `
      <span class="eyebrow">
        TEZİMDE NASIL KULLANABİLİRİM?
      </span>

      <h3>
        Seçtiğin kaynakları tez bölümlerine yerleştir
      </h3>

      <p class="analysis-help">
        Bu öneriler kaynakların kayıtlı amaç, yöntem,
        örneklem, bulgu ve kavram bilgilerine göre
        kural tabanlı hazırlanır.
      </p>

      <div
        id="thesisUseList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      thesisUseCard
    );
  }

  if (
    !document.getElementById(
      "analysisReliabilityCard"
    )
  ) {
    const reliabilityCard =
      document.createElement(
        "article"
      );

    reliabilityCard.id =
      "analysisReliabilityCard";

    reliabilityCard.className =
      "analysis-insight-card wide-analysis-card";

    reliabilityCard.innerHTML = `
      <span class="eyebrow">
        ANALİZ GÜVENİLİRLİĞİ
      </span>

      <h3>
        Karşılaştırmanın güvenilirlik durumunu kontrol et
      </h3>

      <p class="analysis-help">
        Bu bölüm araştırma boşluğu üretmez.
        Sadece eksik veri, AI çıkarımı ve kanıt türleri gibi
        analiz kalitesini etkileyebilecek durumları gösterir.
      </p>

      <div
        id="analysisReliabilityList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      reliabilityCard
    );
  }
}

// =====================================================
// ORTAK BULGULAR
// =====================================================

function renderCommonFindings(
  library
) {
  const container =
    document.getElementById(
      "commonFindingsList"
    );

  if (!container) {
    return [];
  }

  container.innerHTML =
    "";

  const matches =
    findCommonFindings(
      library
    );

  if (!matches.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Seçilen çalışmalar arasında otomatik kurallarla güçlü bir ortak bulgu eşleşmesi bulunamadı.";

    container.appendChild(
      empty
    );

    return [];
  }

  matches.forEach(
    (match) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "pool-item explicit";

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        "evidence-badge explicit";

      badge.textContent =
        "✓ Benzer bulgu adayı";

      const sourceA =
        document.createElement(
          "strong"
        );

      sourceA.textContent =
        match.sourceA.title ||
        match.sourceA.fileName ||
        "Kaynak 1";

      const findingA =
        document.createElement(
          "p"
        );

      findingA.textContent =
        match.findingA;

      const divider =
        document.createElement(
          "small"
        );

      divider.style.display =
        "block";

      divider.style.margin =
        "12px 0 5px";

      divider.style.color =
        "#8a742e";

      divider.textContent =
        "BENZER BULGU";

      const sourceB =
        document.createElement(
          "strong"
        );

      sourceB.textContent =
        match.sourceB.title ||
        match.sourceB.fileName ||
        "Kaynak 2";

      const findingB =
        document.createElement(
          "p"
        );

      findingB.textContent =
        match.findingB;

      card.appendChild(
        badge
      );

      card.appendChild(
        sourceA
      );

      card.appendChild(
        findingA
      );

      card.appendChild(
        divider
      );

      card.appendChild(
        sourceB
      );

      card.appendChild(
        findingB
      );

      container.appendChild(
        card
      );
    }
  );

  return matches;
}

// =====================================================
// FARKLILAŞAN BULGULAR
// =====================================================

function renderDifferentFindings(
  library,
  commonMatches
) {
  const container =
    document.getElementById(
      "differentFindingsList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  const results =
    findDifferentFindings(
      library,
      commonMatches
    );

  if (!results.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Seçilen kaynaklarda belirgin biçimde ayrışan bir bulgu otomatik kurallarla tespit edilmedi.";

    container.appendChild(
      empty
    );

    return;
  }

  results.forEach(
    (entry) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "pool-item fact";

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        "evidence-badge fact";

      badge.textContent =
        "↔ Farklılaşan bulgu";

      const source =
        document.createElement(
          "strong"
        );

      source.textContent =
        entry.source.title ||
        entry.source.fileName ||
        "Kaynak";

      const finding =
        document.createElement(
          "p"
        );

      finding.textContent =
        entry.finding;

      card.appendChild(
        badge
      );

      card.appendChild(
        source
      );

      card.appendChild(
        finding
      );

      container.appendChild(
        card
      );
    }
  );
}

// =====================================================
// TEZDE KULLANIM
// =====================================================

function buildThesisUseSuggestions(
  item
) {
  const suggestions = [];

  if (
    cleanValue(
      item.purpose
    ) ||
    Array.isArray(
      item.keywords
    )
  ) {
    suggestions.push({
      section:
        "Giriş / Problem Durumu",

      text:
        "Araştırmanın amacı ve temel kavramları, konunun önemini ve literatürde nasıl ele alındığını açıklarken kullanılabilir."
    });
  }

  if (
    cleanValue(
      item.method
    ) ||
    cleanValue(
      item.researchDesign
    )
  ) {
    suggestions.push({
      section:
        "Yöntem",

      text:
        `Bu çalışmanın ${normalizeMethodName(
          item
        )} yaklaşımı, kendi araştırma yöntemini gerekçelendirirken veya alternatif yöntemleri karşılaştırırken kullanılabilir.`
    });
  }

  if (
    cleanValue(
      item.sample
    )
  ) {
    suggestions.push({
      section:
        "Yöntem / Örneklem",

      text:
        "Örneklem veya çalışma grubu bilgisi, benzer araştırmalardaki katılımcı yapılarını karşılaştırmak için kullanılabilir."
    });
  }

  if (
    getStudyFindings(
      item
    ).length
  ) {
    suggestions.push({
      section:
        "Literatür / Tartışma",

      text:
        "Temel bulgular, kendi araştırma bulgularınla benzerlik veya farklılık kurarken karşılaştırmalı kaynak olarak kullanılabilir."
    });
  }

  if (
    Array.isArray(
      item.limitationEvidence
    ) &&
    item.limitationEvidence
      .length
  ) {
    suggestions.push({
      section:
        "Tartışma / Gelecek Araştırmalar",

      text:
        "Kaynağın sınırlılıkları, literatürde hangi yöntemsel sorunların tekrarlandığını göstermek ve kendi araştırma tasarımını güçlendirmek için değerlendirilebilir."
    });
  }

  return suggestions;
}

function renderThesisUse(
  library
) {
  const container =
    document.getElementById(
      "thesisUseList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  library.forEach(
    (item) => {
      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.className =
        "comparison-item";

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        item.title ||
        item.fileName ||
        "Başlıksız çalışma";

      wrapper.appendChild(
        title
      );

      const suggestions =
        buildThesisUseSuggestions(
          item
        );

      if (
        !suggestions.length
      ) {
        const text =
          document.createElement(
            "p"
          );

        text.textContent =
          "Bu kaynak için tezde kullanım önerisi oluşturacak yeterli kayıtlı bilgi bulunmuyor.";

        wrapper.appendChild(
          text
        );
      } else {
        suggestions.forEach(
          (suggestion) => {
            const row =
              document.createElement(
                "div"
              );

            row.style.marginTop =
              "10px";

            const section =
              document.createElement(
                "span"
              );

            section.className =
              "evidence-badge fact";

            section.textContent =
              suggestion.section;

            const text =
              document.createElement(
                "p"
              );

            text.style.marginTop =
              "6px";

            text.textContent =
              suggestion.text;

            row.appendChild(
              section
            );

            row.appendChild(
              text
            );

            wrapper.appendChild(
              row
            );
          }
        );
      }

      container.appendChild(
        wrapper
      );
    }
  );
}

// =====================================================
// ARAŞTIRMA BOŞLUĞU
// =====================================================

function buildResearchGapSignals(
  library,
  methodCounts,
  commonKeywords
) {
  const signals = [];

  if (
    Object.keys(
      methodCounts
    ).length === 1
  ) {
    signals.push(
      `Seçilen çalışmaların tamamı aynı genel yöntem grubunda (${Object.keys(
        methodCounts
      )[0]}) yer alıyor. Literatürde farklı yöntemlerle yürütülen çalışmaların azlığı potansiyel bir yöntemsel boşluk sinyali olabilir.`
    );
  }

  if (
    commonKeywords.length <=
      1 &&
    library.length >= 3
  ) {
    signals.push(
      "Seçilen çalışmalar arasında çok az ortak anahtar kavram bulunuyor. Bu durum literatürün dağınık olduğunu veya henüz yeterli tematik yoğunluğa ulaşılmadığını gösterebilir."
    );
  }

  const sampleTexts =
    library
      .map(
        (item) =>
          normalizeSearchText(
            item.sample
          )
      )
      .filter(Boolean);

  if (
    sampleTexts.length >= 2
  ) {
    const uniqueSamples =
      new Set(
        sampleTexts
      );

    if (
      uniqueSamples.size ===
      1
    ) {
      signals.push(
        "Seçilen çalışmalar benzer veya aynı örneklem yapısına odaklanıyor. Farklı örneklem gruplarının yeterince incelenmemiş olması potansiyel bir araştırma boşluğu olabilir."
      );
    }
  }

  const geographicTerms = [
    "türkiye",
    "avrupa",
    "ortadoğu",
    "asya",
    "afrika",
    "amerika",
    "abd",
    "ingiltere",
    "isveç",
    "rusya",
    "katar",
    "ırak"
  ];

  const foundRegions =
    new Set();

  library.forEach(
    (item) => {
      const allText =
        normalizeSearchText(
          [
            item.population,
            item.sample,
            item.summary,
            item.title
          ]
            .filter(Boolean)
            .join(" ")
        );

      geographicTerms
        .forEach(
          (region) => {
            if (
              allText.includes(
                region
              )
            ) {
              foundRegions.add(
                region
              );
            }
          }
        );
    }
  );

  if (
    library.length >= 3 &&
    foundRegions.size <= 1
  ) {
    signals.push(
      "Seçilen çalışmaların coğrafi çeşitliliği sınırlı görünüyor. Farklı ülke veya bölgelerde yürütülen araştırmaların azlığı potansiyel bir boşluk sinyali olabilir."
    );
  }

  if (!signals.length) {
    signals.push(
      "Mevcut seçili kaynaklardan yalnızca kural tabanlı analizle güçlü bir araştırma boşluğu sinyali belirlenemedi. Daha fazla ve daha çeşitli kaynak eklendikçe bu bölüm daha anlamlı hale gelecektir."
    );
  }

  return signals;
}

// =====================================================
// ANALİZ GÜVENİLİRLİĞİ
// =====================================================

function buildReliabilitySignals(
  library
) {
  const signals = [];

  const missingSample =
    library.filter(
      (item) =>
        !cleanValue(
          item.sample
        )
    ).length;

  if (missingSample) {
    signals.push({
      type: "warning",

      text:
        `${missingSample} seçili çalışmada örneklem bilgisi bulunmuyor. Örneklem karşılaştırması eksik veri içeriyor.`
    });
  }

  const missingMethod =
    library.filter(
      (item) =>
        !cleanValue(
          item.method
        ) &&
        !cleanValue(
          item.researchDesign
        )
    ).length;

  if (missingMethod) {
    signals.push({
      type: "warning",

      text:
        `${missingMethod} seçili çalışmada yöntem veya araştırma deseni bilgisi eksik. Yöntem haritası bu nedenle tam olmayabilir.`
    });
  }

  const inferenceCount =
    library.reduce(
      (total, item) =>
        total +
        (
          Array.isArray(
            item.limitationEvidence
          )
            ? item
                .limitationEvidence
                .filter(
                  (entry) =>
                    entry.evidenceType ===
                    "inference"
                )
                .length
            : 0
        ),
      0
    );

  if (inferenceCount) {
    signals.push({
      type: "info",

      text:
        `${inferenceCount} sınırlılık Academic AI çıkarımı olarak işaretlenmiş. Bunlar araştırmacının açıkça belirttiği sınırlılıklar değildir.`
    });
  }

  const factCount =
    library.reduce(
      (total, item) =>
        total +
        (
          Array.isArray(
            item.limitationEvidence
          )
            ? item
                .limitationEvidence
                .filter(
                  (entry) =>
                    entry.evidenceType ===
                    "fact"
                )
                .length
            : 0
        ),
      0
    );

  if (factCount) {
    signals.push({
      type: "info",

      text:
        `${factCount} sınırlılık ilişkili kayıt yalnızca belgesel gerçek olarak işaretlenmiş. Bu maddeler doğrudan “araştırmanın sınırlılığı” olarak yorumlanmamalıdır.`
    });
  }

  const noEvidenceFindings =
    library.filter(
      (item) =>
        !Array.isArray(
          item.findingEvidence
        ) ||
        !item.findingEvidence
          .length
    ).length;

  if (
    noEvidenceFindings
  ) {
    signals.push({
      type: "warning",

      text:
        `${noEvidenceFindings} seçili çalışmada kanıtlı bulgu kaydı bulunmuyor. Bulgu karşılaştırmaları bu kaynaklarda daha düşük doğrulanabilirliğe sahiptir.`
    });
  }

  if (!signals.length) {
    signals.push({
      type: "success",

      text:
        "Seçilen kaynakların temel yöntem, örneklem ve kanıt alanlarında belirgin bir eksiklik görünmüyor."
    });
  }

  return signals;
}

function renderReliabilitySignals(
  library
) {
  const container =
    document.getElementById(
      "analysisReliabilityList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  const signals =
    buildReliabilitySignals(
      library
    );

  signals.forEach(
    (signal) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "comparison-item";

      const badge =
        document.createElement(
          "span"
        );

      if (
        signal.type ===
        "success"
      ) {
        badge.className =
          "evidence-badge explicit";

        badge.textContent =
          "✓ Güvenilirlik durumu";
      } else if (
        signal.type ===
        "warning"
      ) {
        badge.className =
          "evidence-badge inference";

        badge.textContent =
          "⚠ Veri uyarısı";
      } else {
        badge.className =
          "evidence-badge fact";

        badge.textContent =
          "ℹ Kanıt durumu";
      }

      const text =
        document.createElement(
          "p"
        );

      text.style.marginTop =
        "7px";

      text.textContent =
        signal.text;

      item.appendChild(
        badge
      );

      item.appendChild(
        text
      );

      container.appendChild(
        item
      );
    }
  );
}
// =====================================================
// AKILLI LİTERATÜR SENTEZİ V2 — ÜCRETSİZ YEREL KATMAN
// =====================================================

function getEvidenceCoverageScore(item) {
  let score = 0;
  let possible = 0;

  const addField = (value, weight = 1) => {
    possible += weight;

    const hasValue = Array.isArray(value)
      ? value.filter(Boolean).length > 0
      : Boolean(cleanValue(value));

    if (hasValue) {
      score += weight;
    }
  };

  addField(item.purpose, 1);
  addField(item.method, 1);
  addField(item.researchDesign, 1);
  addField(item.sample, 1);
  addField(item.dataCollection, 1);
  addField(item.dataAnalysis, 1);
  addField(getStudyFindings(item), 2);
  addField(item.findingEvidence, 2);
  addField(item.limitationEvidence, 1);
  addField(item.recommendationEvidence, 1);
  addField(item.keywords, 1);

  return possible
    ? Math.round((score / possible) * 100)
    : 0;
}

function getEvidenceCoverageLabel(score) {
  if (score >= 80) {
    return "Güçlü kayıt kapsamı";
  }

  if (score >= 55) {
    return "Orta kayıt kapsamı";
  }

  return "Sınırlı kayıt kapsamı";
}

function renderEvidenceStrength(library) {
  const container =
    document.getElementById(
      "evidenceStrengthList"
    );

  if (!container) return;

  container.innerHTML = "";

  library
    .map((item) => ({
      item,
      score:
        getEvidenceCoverageScore(
          item
        )
    }))
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .forEach(
      ({ item, score }) => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "comparison-item";

        const badge =
          document.createElement(
            "span"
          );

        badge.className =
          score >= 80
            ? "evidence-badge explicit"
            : score >= 55
              ? "evidence-badge fact"
              : "evidence-badge inference";

        badge.textContent =
          `${getEvidenceCoverageLabel(
            score
          )} · %${score}`;

        const title =
          document.createElement(
            "strong"
          );

        title.style.display =
          "block";

        title.style.marginTop =
          "8px";

        title.textContent =
          item.title ||
          item.fileName ||
          "Başlıksız çalışma";

        const detail =
          document.createElement(
            "p"
          );

        const evidenceCount =
          Array.isArray(
            item.findingEvidence
          )
            ? item.findingEvidence
                .length
            : 0;

        const methodExists =
          cleanValue(
            item.method
          ) ||
          cleanValue(
            item.researchDesign
          );

        detail.textContent =
          `Kanıtlı bulgu: ${evidenceCount} · ` +
          `Yöntem: ${methodExists ? "var" : "eksik"} · ` +
          `Örneklem: ${
            cleanValue(item.sample)
              ? "var"
              : "eksik"
          }.`;

        row.appendChild(
          badge
        );

        row.appendChild(
          title
        );

        row.appendChild(
          detail
        );

        container.appendChild(
          row
        );
      }
    );
}

function buildSynthesisOverview(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const rows = [];

  const methodEntries =
    Object.entries(
      methodCounts
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  const coverageScores =
    library.map(
      getEvidenceCoverageScore
    );

  const averageCoverage =
    coverageScores.length
      ? Math.round(
          coverageScores.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
            coverageScores.length
        )
      : 0;

  rows.push({
    badge: "Kapsam",
    type: "fact",
    text:
      `${library.length} çalışma karşılaştırılıyor. ` +
      `${methodEntries.length} genel yöntem grubu ve ` +
      `${commonKeywords.length} tekrar eden anahtar kavram bulundu.`
  });

  if (methodEntries.length) {
    const dominant =
      methodEntries[0];

    const share =
      Math.round(
        (
          dominant[1] /
          library.length
        ) * 100
      );

    rows.push({
      badge:
        "Yöntem örüntüsü",

      type:
        share >= 70
          ? "inference"
          : "fact",

      text:
        `${dominant[0]} yaklaşımı ${dominant[1]} çalışmayla ` +
        `seçili kaynakların yaklaşık %${share}'ini oluşturuyor.`
    });
  }

  if (
    commonFindings.length
  ) {
    rows.push({
      badge: "Bulgular",
      type: "explicit",

      text:
        `${commonFindings.length} benzer bulgu çifti bulundu. ` +
        "Bunlar ortak sonuç adayıdır; aynı araştırma sorusuna verilen eşdeğer yanıtlar olduğu ayrıca kontrol edilmelidir."
    });
  } else {
    rows.push({
      badge: "Bulgular",
      type: "inference",

      text:
        "Otomatik eşik üzerinde güçlü bir ortak bulgu çifti bulunamadı. Bu durum çalışmaların farklı odaklara sahip olmasından veya kayıtlı bulguların sınırlı olmasından kaynaklanabilir."
    });
  }

  rows.push({
    badge:
      "Kayıt kapsamı",

    type:
      averageCoverage >= 70
        ? "explicit"
        : "inference",

    text:
      `Seçili kaynakların ortalama kayıt kapsamı %${averageCoverage}. ` +
      "Bu oran bilimsel kalite puanı değildir; yalnızca karşılaştırma için elimizde bulunan yapılandırılmış verinin doluluğunu gösterir."
  });

  return rows;
}

function renderSynthesisOverview(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const container =
    document.getElementById(
      "synthesisOverviewList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  buildSynthesisOverview(
    library,
    methodCounts,
    commonKeywords,
    commonFindings
  ).forEach(
    (entry) => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "comparison-item";

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        `evidence-badge ${entry.type}`;

      badge.textContent =
        entry.badge;

      const text =
        document.createElement(
          "p"
        );

      text.style.marginTop =
        "7px";

      text.textContent =
        entry.text;

      row.appendChild(
        badge
      );

      row.appendChild(
        text
      );

      container.appendChild(
        row
      );
    }
  );
}

function renderMethodFindingRelations(
  library
) {
  const container =
    document.getElementById(
      "methodFindingRelationList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  const groups = {};

  library.forEach(
    (item) => {
      const method =
        normalizeMethodName(
          item
        );

      if (!groups[method]) {
        groups[method] = [];
      }

      groups[method].push(
        item
      );
    }
  );

  Object.entries(groups)
    .sort(
      (a, b) =>
        b[1].length -
        a[1].length
    )
    .forEach(
      ([method, studies]) => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "comparison-item";

        const badge =
          document.createElement(
            "span"
          );

        badge.className =
          "evidence-badge fact";

        badge.textContent =
          `${method} · ${studies.length} çalışma`;

        row.appendChild(
          badge
        );

        studies
          .slice(0, 5)
          .forEach(
            (study) => {
              const findings =
                getStudyFindings(
                  study
                );

              const source =
                document.createElement(
                  "strong"
                );

              source.style.display =
                "block";

              source.style.marginTop =
                "10px";

              source.textContent =
                study.title ||
                study.fileName ||
                "Başlıksız çalışma";

              row.appendChild(
                source
              );

              if (
                findings.length
              ) {
                const finding =
                  document.createElement(
                    "p"
                  );

                finding.textContent =
                  shorten(
                    findings[0],
                    300
                  );

                row.appendChild(
                  finding
                );
              } else {
                const missing =
                  document.createElement(
                    "p"
                  );

                missing.textContent =
                  "Bu çalışma için kayıtlı temel bulgu bulunmuyor.";

                row.appendChild(
                  missing
                );
              }
            }
          );

        container.appendChild(
          row
        );
      }
    );
}

function getRecommendationTexts(
  item
) {
  const explicit =
    Array.isArray(
      item.recommendationEvidence
    )
      ? item
          .recommendationEvidence
          .filter(
            (entry) =>
              entry &&
              entry.evidenceType ===
                "explicit" &&
              cleanValue(
                entry.text
              )
          )
          .map(
            (entry) =>
              cleanValue(
                entry.text
              )
          )
      : [];

  if (
    explicit.length
  ) {
    return explicit;
  }

  return Array.isArray(
    item.recommendations
  )
    ? item.recommendations
        .map(cleanValue)
        .filter(Boolean)
    : [];
}

function getExplicitLimitationTexts(
  item
) {
  return Array.isArray(
    item.limitationEvidence
  )
    ? item
        .limitationEvidence
        .filter(
          (entry) =>
            entry &&
            entry.evidenceType ===
              "explicit" &&
            cleanValue(
              entry.text
            )
        )
        .map(
          (entry) =>
            cleanValue(
              entry.text
            )
        )
    : [];
}

function buildResearchOpportunities(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const opportunities =
    [];

  const methodNames =
    Object.keys(
      methodCounts
    ).filter(
      (name) =>
        name !==
        "Belirtilmemiş"
    );

  if (
    methodNames.length === 1
  ) {
    opportunities.push({
      badge:
        "Yöntem çeşitliliği",

      text:
        `Seçili literatür ağırlıklı olarak ${methodNames[0]} yaklaşımında. ` +
        "Aynı problemi farklı bir yöntemle inceleyen karşılaştırmalı veya karma tasarımlı bir çalışma, seçili kaynakların kapsamadığı bir bakış açısını test edebilir."
    });
  }

  const samples =
    library
      .map(
        (item) =>
          cleanValue(
            item.sample
          )
      )
      .filter(Boolean);

  if (
    samples.length >= 2 &&
    new Set(
      samples.map(
        normalizeSearchText
      )
    ).size <=
      Math.ceil(
        samples.length / 2
      )
  ) {
    opportunities.push({
      badge:
        "Örneklem çeşitliliği",

      text:
        "Seçili çalışmalar benzer örneklem veya çalışma gruplarında yoğunlaşıyor. Farklı mesleki, kurumsal veya demografik gruplarda aynı sorunun yeniden sınanması araştırma fırsatı olabilir."
    });
  }

  const explicitLimitations =
    library.flatMap(
      getExplicitLimitationTexts
    );

  if (
    explicitLimitations.length
  ) {
    opportunities.push({
      badge:
        "Araştırmacı sınırlılıkları",

      text:
        `Seçili kaynaklarda araştırmacıların açıkça belirttiği ${explicitLimitations.length} sınırlılık kaydı var. ` +
        `Örneğin: ${shorten(
          explicitLimitations[0],
          240
        )} Bu sınırlılığı azaltacak yeni bir tasarım doğrudan takip çalışması adayıdır.`
    });
  }

  const recommendations =
    library.flatMap(
      getRecommendationTexts
    );

  if (
    recommendations.length
  ) {
    opportunities.push({
      badge:
        "Araştırmacı önerisi",

      text:
        `Kaynaklarda gelecek çalışmalar için kullanılabilecek ${recommendations.length} öneri kaydı var. ` +
        `Öne çıkan örnek: ${shorten(
          recommendations[0],
          250
        )}`
    });
  }

  if (
    commonKeywords.length >= 2 &&
    !commonFindings.length
  ) {
    opportunities.push({
      badge:
        "Aynı tema, farklı sonuç",

      text:
        "Çalışmalar ortak kavramları paylaşıyor ancak otomatik eşik üzerinde ortak bulgu oluşmadı. Aynı kavramların farklı bağlam, örneklem veya yöntemlerde neden farklı sonuçlara eşlik ettiğini inceleyen bir karşılaştırma araştırması yapılabilir."
    });
  }

  if (
    !opportunities.length
  ) {
    opportunities.push({
      badge:
        "Daha fazla kanıt gerekli",

      text:
        "Seçili kayıtlarla güçlü bir özgün araştırma fırsatı sinyali üretilemedi. Daha fazla kaynak, açık sınırlılık ve araştırmacı önerisi eklendiğinde bu bölüm güçlenecektir."
    });
  }

  return opportunities
    .slice(0, 8);
}

function renderResearchOpportunities(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const container =
    document.getElementById(
      "researchOpportunityList"
    );

  if (!container) return;

  container.innerHTML =
    "";

  buildResearchOpportunities(
    library,
    methodCounts,
    commonKeywords,
    commonFindings
  ).forEach(
    (entry) => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "comparison-item";

      const badge =
        document.createElement(
          "span"
        );

      badge.className =
        "evidence-badge inference";

      badge.textContent =
        entry.badge;

      const text =
        document.createElement(
          "p"
        );

      text.style.marginTop =
        "7px";

      text.textContent =
        entry.text;

      row.appendChild(
        badge
      );

      row.appendChild(
        text
      );

      container.appendChild(
        row
      );
    }
  );
}

// =====================================================
// KAYNAK SEÇİM PANELİ
// =====================================================

function renderLiteratureSelector(
  library,
  content
) {
  let selector =
    document.getElementById(
      "literatureSourceSelector"
    );

  if (!selector) {
    selector =
      document.createElement(
        "section"
      );

    selector.id =
      "literatureSourceSelector";

    selector.className =
      "analysis-insight-card literature-selector";

    content.insertBefore(
      selector,
      content.firstChild
    );
  }

  selector.innerHTML =
    "";

  const eyebrow =
    document.createElement(
      "span"
    );

  eyebrow.className =
    "eyebrow";

  eyebrow.textContent =
    "KARŞILAŞTIRILACAK KAYNAKLAR";

  const heading =
    document.createElement(
      "h3"
    );

  heading.textContent =
    "Hangi çalışmaları karşılaştırmak istiyorsun?";

  const description =
    document.createElement(
      "p"
    );

  description.className =
    "analysis-help";

  description.textContent =
    "En az iki çalışma seç. Aşağıdaki karşılaştırmalar yalnızca seçtiğin kaynaklara göre hesaplanır.";

  const counter =
    document.createElement(
      "strong"
    );

  counter.id =
    "literatureSelectedCount";

  selector.appendChild(
    eyebrow
  );

  selector.appendChild(
    heading
  );

  selector.appendChild(
    description
  );

  selector.appendChild(
    counter
  );

  const list =
    document.createElement(
      "div"
    );

  list.style.display =
    "grid";

  list.style.gridTemplateColumns =
    "repeat(2,minmax(0,1fr))";

  list.style.gap =
    "10px";

  list.style.marginTop =
    "15px";

  library.forEach(
    (item) => {
      const id =
        getItemId(item);

      const label =
        document.createElement(
          "label"
        );

      label.style.display =
        "flex";

      label.style.gap =
        "10px";

      label.style.padding =
        "13px";

      label.style.background =
        "#f8f8f4";

      label.style.border =
        "1px solid #e1e1da";

      label.style.borderRadius =
        "10px";

      label.style.cursor =
        "pointer";

      const checkbox =
        document.createElement(
          "input"
        );

      checkbox.type =
        "checkbox";

      checkbox.checked =
        selectedLiteratureIds
          .includes(id);

      const info =
        document.createElement(
          "div"
        );

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        item.title ||
        item.fileName ||
        "Başlıksız çalışma";

      const method =
        document.createElement(
          "small"
        );

      method.style.display =
        "block";

      method.style.marginTop =
        "5px";

      method.textContent =
        normalizeMethodName(
          item
        );

      info.appendChild(
        title
      );

      info.appendChild(
        method
      );

      label.appendChild(
        checkbox
      );

      label.appendChild(
        info
      );

      checkbox
        .addEventListener(
          "change",
          () => {
            if (
              checkbox.checked
            ) {
              if (
                !selectedLiteratureIds
                  .includes(id)
              ) {
                selectedLiteratureIds.push(
                  id
                );
              }
            } else {
              selectedLiteratureIds =
                selectedLiteratureIds.filter(
                  (value) =>
                    value !== id
                );
            }

            literatureSelectionMessage =
              "";

            saveLiteratureSelection();

            updateLiteratureSelectorStatus();

            updateAssistantSourceStatus();
          }
        );

      list.appendChild(
        label
      );
    }
  );

  selector.appendChild(
    list
  );

  const actions =
    document.createElement(
      "div"
    );

  actions.style.display =
    "flex";

  actions.style.gap =
    "8px";

  actions.style.flexWrap =
    "wrap";

  actions.style.marginTop =
    "16px";

  const selectAllButton =
    document.createElement(
      "button"
    );

  selectAllButton.type =
    "button";

  selectAllButton.textContent =
    "Tümünü Seç";

  selectAllButton.style.padding =
    "9px 12px";

  const clearButton =
    document.createElement(
      "button"
    );

  clearButton.type =
    "button";

  clearButton.textContent =
    "Seçimi Temizle";

  clearButton.style.padding =
    "9px 12px";

  const compareButton =
    document.createElement(
      "button"
    );

  compareButton.type =
    "button";

  compareButton.className =
    "primary";

  compareButton.textContent =
    "↔ Seçilenleri Karşılaştır";

  const message =
    document.createElement(
      "small"
    );

  message.id =
    "literatureSelectionMessage";

  message.style.width =
    "100%";

  actions.appendChild(
    selectAllButton
  );

  actions.appendChild(
    clearButton
  );

  actions.appendChild(
    compareButton
  );

  actions.appendChild(
    message
  );

  selector.appendChild(
    actions
  );

  selectAllButton
    .addEventListener(
      "click",
      () => {
        selectedLiteratureIds =
          library.map(
            (item) =>
              getItemId(item)
          );

        literatureSelectionMessage =
          "";

        saveLiteratureSelection();

        renderLiteratureAnalysis();

        updateAssistantSourceStatus();
      }
    );

  clearButton
    .addEventListener(
      "click",
      () => {
        selectedLiteratureIds =
          [];

        literatureSelectionMessage =
          "";

        saveLiteratureSelection();

        renderLiteratureAnalysis();

        updateAssistantSourceStatus();
      }
    );

  compareButton
    .addEventListener(
      "click",
      () => {
        if (
          selectedLiteratureIds
            .length < 2
        ) {
          literatureSelectionMessage =
            "Karşılaştırma için en az 2 çalışma seçmelisin.";

          updateLiteratureSelectorStatus();

          return;
        }

        comparedLiteratureIds = [
          ...selectedLiteratureIds
        ];

        literatureSelectionMessage =
          `${comparedLiteratureIds.length} çalışma karşılaştırmaya alındı.`;

        saveLiteratureSelection();

        renderLiteratureAnalysis();

        updateAssistantSourceStatus();
      }
    );

  updateLiteratureSelectorStatus();
}

function updateLiteratureSelectorStatus() {
  const counter =
    document.getElementById(
      "literatureSelectedCount"
    );

  const message =
    document.getElementById(
      "literatureSelectionMessage"
    );

  if (counter) {
    counter.textContent =
      `${selectedLiteratureIds.length} çalışma seçildi`;
  }

  if (message) {
    message.textContent =
      literatureSelectionMessage;

    message.style.color =
      selectedLiteratureIds
        .length < 2
        ? "#8b5d29"
        : "#476d5d";
  }
}
function getComparedLibrary(
  library
) {
  const validCompared =
    comparedLiteratureIds
      .filter(
        (id) =>
          library.some(
            (item) =>
              getItemId(
                item
              ) === id
          )
      );

  if (
    validCompared.length >= 2
  ) {
    return library.filter(
      (item) =>
        validCompared.includes(
          getItemId(item)
        )
    );
  }

  const validSelected =
    selectedLiteratureIds
      .filter(
        (id) =>
          library.some(
            (item) =>
              getItemId(
                item
              ) === id
          )
      );

  if (
    validSelected.length >= 2
  ) {
    return library.filter(
      (item) =>
        validSelected.includes(
          getItemId(item)
        )
    );
  }

  return library;
}

// =====================================================
// KAYNAK EKSİKSE AKADEMİK KAYNAK ÖNERİSİ
// OpenAlex metadata araması — AI kredisi kullanmaz
// =====================================================

const suggestSourcesButton =
  document.getElementById(
    "suggestSourcesButton"
  );

const sourceSuggestionStatus =
  document.getElementById(
    "sourceSuggestionStatus"
  );

const sourceSuggestionResults =
  document.getElementById(
    "sourceSuggestionResults"
  );

function buildSourceSuggestionQuery() {
  const library = getLibrary();
  const first = library[0] || {};

  const keywords = Array.isArray(first.keywords)
    ? first.keywords.slice(0, 5).join(" ")
    : "";

  return cleanValue(
    [first.title, keywords]
      .filter(Boolean)
      .join(" ")
  );
}

function addSuggestedSourceToLibrary(source) {
  const library = getLibrary();

  const duplicate = library.some((item) => {
    const itemDoi = cleanValue(item?.meta?.doi || item?.doi)
      .toLowerCase();
    const sourceDoi = cleanValue(source?.doi)
      .toLowerCase();

    if (itemDoi && sourceDoi) {
      return itemDoi === sourceDoi;
    }

    return normalizeSearchText(item?.title) ===
      normalizeSearchText(source?.title);
  });

  if (duplicate) {
    return false;
  }

  const record = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: source.title || "Başlıksız çalışma",
    purpose: "",
    researchProblem: "",
    method: "",
    researchDesign: "",
    population: "",
    sample: "",
    dataCollection: "",
    dataAnalysis: "",
    summary: "",
    findings: [],
    conclusions: [],
    recommendations: [],
    keywords: Array.isArray(source.keywords)
      ? source.keywords
      : [],
    contribution: "",
    findingEvidence: [],
    conclusionEvidence: [],
    limitationEvidence: [],
    recommendationEvidence: [],
    fileName: "Academic AI kaynak önerisi",
    savedAt: new Date().toISOString(),
    suggestedSource: true,
    meta: {
      authors: source.authors || "",
      year: source.year || "",
      source: source.source || "",
      doi: source.doi || "",
      url: source.url || "",
      openAccess: Boolean(source.openAccess),
      citedByCount: Number(source.citedByCount || 0),
      provider: "OpenAlex"
    }
  };

  library.unshift(record);
  setLibrary(library);
  return true;
}

function renderSourceSuggestions(sources) {
  if (!sourceSuggestionResults) return;

  sourceSuggestionResults.innerHTML = "";
  sourceSuggestionResults.hidden = false;

  if (!Array.isArray(sources) || !sources.length) {
    sourceSuggestionResults.innerHTML =
      '<div class="source-suggestion-empty">Uygun akademik kaynak önerisi bulunamadı.</div>';
    return;
  }

  sources.forEach((source) => {
    const card = document.createElement("article");
    card.className = "source-suggestion-card";

    const title = document.createElement("h4");
    title.textContent = source.title || "Başlıksız çalışma";

    const meta = document.createElement("p");
    meta.className = "source-suggestion-meta";
    meta.textContent = [
      source.authors,
      source.year,
      source.source
    ].filter(Boolean).join(" · ") || "Bibliyografik bilgi sınırlı";

    const badges = document.createElement("div");
    badges.className = "source-suggestion-badges";

    if (source.doi) {
      const doiBadge = document.createElement("span");
      doiBadge.textContent = `DOI: ${source.doi}`;
      badges.appendChild(doiBadge);
    }

    if (source.openAccess) {
      const oaBadge = document.createElement("span");
      oaBadge.textContent = "Açık erişim";
      badges.appendChild(oaBadge);
    }

    const actions = document.createElement("div");
    actions.className = "source-suggestion-card-actions";

    if (source.url) {
      const open = document.createElement("a");
      open.className = "secondary-button source-link-button";
      open.href = source.url;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "Kaynağı aç";
      actions.appendChild(open);
    }

    const add = document.createElement("button");
    add.type = "button";
    add.className = "primary";
    add.textContent = "＋ Literatürüme Ekle";

    add.addEventListener("click", () => {
      const added = addSuggestedSourceToLibrary(source);

      if (added) {
        add.disabled = true;
        add.textContent = "✓ Literatüre Eklendi";
      } else {
        add.disabled = true;
        add.textContent = "Zaten Literatüründe";
      }
    });

    actions.appendChild(add);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(badges);
    card.appendChild(actions);
    sourceSuggestionResults.appendChild(card);
  });
}

async function requestSourceSuggestions() {
  const query = buildSourceSuggestionQuery();

  if (!query) {
    if (sourceSuggestionStatus) {
      sourceSuggestionStatus.hidden = false;
      sourceSuggestionStatus.textContent =
        "Öneri oluşturmak için önce en az bir kaynak eklemelisin.";
    }
    return;
  }

  if (suggestSourcesButton) {
    suggestSourcesButton.disabled = true;
    suggestSourcesButton.textContent = "Kaynaklar aranıyor…";
  }

  if (sourceSuggestionStatus) {
    sourceSuggestionStatus.hidden = false;
    sourceSuggestionStatus.textContent =
      "Akademik veritabanında ilgili çalışmalar aranıyor. Bu işlem AI kredisi kullanmaz.";
  }

  try {
    const response = await fetch("/api/source-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Kaynak önerileri alınamadı.");
    }

    renderSourceSuggestions(data.sources || []);

    if (sourceSuggestionStatus) {
      sourceSuggestionStatus.textContent =
        `${(data.sources || []).length} ilgili akademik kaynak bulundu. Eklemek istediğini sen seçebilirsin.`;
    }
  } catch (error) {
    if (sourceSuggestionStatus) {
      sourceSuggestionStatus.textContent =
        cleanPublicErrorMessage(error.message || "Kaynak önerileri alınamadı.");
    }
  } finally {
    if (suggestSourcesButton) {
      suggestSourcesButton.disabled = false;
      suggestSourcesButton.textContent = "✦ Academic AI kaynak önersin";
    }
  }
}

suggestSourcesButton?.addEventListener(
  "click",
  requestSourceSuggestions
);

// =====================================================
// LİTERATÜR ANALİZİ
// =====================================================

function renderLiteratureAnalysis() {
  const library =
    getLibrary();

  const empty =
    document.getElementById(
      "literatureAnalysisEmpty"
    );

  const content =
    document.getElementById(
      "literatureAnalysisContent"
    );

  if (
    !empty ||
    !content
  ) {
    return;
  }

  if (
    library.length < 2
  ) {
    empty.hidden =
      false;

    content.hidden =
      true;

    return;
  }

  empty.hidden =
    true;

  content.hidden =
    false;

  ensureAdvancedLiteratureSections(
    content
  );

  renderLiteratureSelector(
    library,
    content
  );

  const comparedLibrary =
    getComparedLibrary(
      library
    );

  if (
    comparedLibrary.length < 2
  ) {
    content
      .querySelectorAll(
        ".analysis-insight-card:not(.literature-selector)"
      )
      .forEach(
        (card) => {
          card.style.display =
            "none";
        }
      );

    return;
  }

  content
    .querySelectorAll(
      ".analysis-insight-card"
    )
    .forEach(
      (card) => {
        card.style.display =
          "";
      }
    );

  const methodCounts = {};

  comparedLibrary.forEach(
    (item) => {
      const method =
        normalizeMethodName(
          item
        );

      methodCounts[
        method
      ] =
        (
          methodCounts[
            method
          ] || 0
        ) + 1;
    }
  );

  const keywordStats =
    getKeywordStatistics(
      comparedLibrary
    );

  const commonKeywords =
    Object.entries(
      keywordStats
    )
      .filter(
        ([, count]) =>
          count >= 2
      )
      .sort(
        (a, b) =>
          b[1] - a[1]
      );

    renderMethodDistribution(
    methodCounts
  );

  renderCommonKeywords(
    commonKeywords,
    comparedLibrary
  );

  renderStudyComparison(
    comparedLibrary
  );

  renderResearchGapSignals(
    buildResearchGapSignals(
      comparedLibrary,
      methodCounts,
      commonKeywords
    )
  );

  const commonFindings =
    renderCommonFindings(
      comparedLibrary
    );

  renderDifferentFindings(
    comparedLibrary,
    commonFindings
  );

  // =====================================================
  // AKILLI LİTERATÜR SENTEZİ V2
  // ÜCRETSİZ YEREL ANALİZ
  // =====================================================

  renderSynthesisOverview(
    comparedLibrary,
    methodCounts,
    commonKeywords,
    commonFindings
  );

  renderEvidenceStrength(
    comparedLibrary
  );

  renderMethodFindingRelations(
    comparedLibrary
  );

  renderResearchOpportunities(
    comparedLibrary,
    methodCounts,
    commonKeywords,
    commonFindings
  );

  // =====================================================
  // MEVCUT ANALİZLER
  // =====================================================

  renderThesisUse(
    comparedLibrary
  );

  renderReliabilitySignals(
    comparedLibrary
  );
}

// =====================================================
// YÖNTEM DAĞILIMI
// =====================================================

function renderMethodDistribution(
  methodCounts
) {
  const container =
    document.getElementById(
      "methodDistribution"
    );

  if (!container) return;

  container.innerHTML =
    "";

  const entries =
    Object.entries(
      methodCounts
    );

  if (!entries.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Yöntem dağılımı oluşturulamadı.";

    container.appendChild(
      empty
    );

    return;
  }

  entries
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .forEach(
      ([method, count]) => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "method-row";

        const info =
          document.createElement(
            "div"
          );

        info.className =
          "method-row-info";

        const label =
          document.createElement(
            "strong"
          );

        label.textContent =
          method;

        const countText =
          document.createElement(
            "span"
          );

        countText.textContent =
          `${count} çalışma`;

        info.appendChild(
          label
        );

        info.appendChild(
          countText
        );

        const bar =
          document.createElement(
            "div"
          );

        bar.className =
          "method-bar";

        const fill =
          document.createElement(
            "div"
          );

        fill.className =
          "method-bar-fill";

        const max =
          Math.max(
            ...entries.map(
              ([, itemCount]) =>
                itemCount
            )
          );

        fill.style.width =
          `${Math.max(
            12,
            Math.round(
              (
                count /
                max
              ) *
                100
            )
          )}%`;

        bar.appendChild(
          fill
        );

        row.appendChild(
          info
        );

        row.appendChild(
          bar
        );

        container.appendChild(
          row
        );
      }
    );
}

// =====================================================
// ORTAK ANAHTAR KAVRAMLAR
// =====================================================

function renderCommonKeywords(
  commonKeywords,
  library
) {
  const container =
    document.getElementById(
      "commonKeywords"
    );

  if (!container) return;

  container.innerHTML =
    "";

  if (
    !commonKeywords.length
  ) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Seçilen çalışmalar arasında tekrar eden ortak anahtar kavram bulunamadı.";

    container.appendChild(
      empty
    );

    return;
  }

  commonKeywords
    .slice(0, 15)
    .forEach(
      ([keyword, count]) => {
        const tag =
          document.createElement(
            "span"
          );

        tag.className =
          "common-keyword";

        tag.textContent =
          `${getDisplayKeyword(
            keyword,
            library
          )} · ${count}`;

        container.appendChild(
          tag
        );
      }
    );
}

// =====================================================
// ÇALIŞMA KARŞILAŞTIRMASI
// =====================================================

function renderStudyComparison(
  library
) {
  const container =
    document.getElementById(
      "studyComparison"
    );

  if (!container) return;

  container.innerHTML =
    "";

  library.forEach(
    (item) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "comparison-item";

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        item.title ||
        item.fileName ||
        "Başlıksız çalışma";

      const method =
        document.createElement(
          "p"
        );

      method.innerHTML =
        `<b>Yöntem:</b> ${normalizeMethodName(
          item
        )}`;

      const sample =
        document.createElement(
          "p"
        );

      sample.innerHTML =
        `<b>Örneklem:</b> ${
          cleanValue(
            item.sample
          ) ||
          "Belirlenemedi"
        }`;

      const purpose =
        document.createElement(
          "p"
        );

      purpose.innerHTML =
        `<b>Amaç:</b> ${
          cleanValue(
            item.purpose
          ) ||
          "Belirlenemedi"
        }`;

      card.appendChild(
        title
      );

      card.appendChild(
        method
      );

      card.appendChild(
        sample
      );

      card.appendChild(
        purpose
      );

      container.appendChild(
        card
      );
    }
  );
}

// =====================================================
// ARAŞTIRMA BOŞLUĞU GÖRÜNÜMÜ
// =====================================================

function renderResearchGapSignals(
  signals
) {
  const container =
    document.getElementById(
      "researchGapSignals"
    );

  if (!container) return;

  container.innerHTML =
    "";

  signals.forEach(
    (signal) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "comparison-item";

      item.textContent =
        signal;

      container.appendChild(
        item
      );
    }
  );
}
// =====================================================
// AKILLI LİTERATÜR SENTEZİ V2
// ÜCRETSİZ YEREL ANALİZ
// =====================================================

// =====================================================
// 1. GENEL LİTERATÜR SENTEZİ
// =====================================================

function renderSynthesisOverview(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const container =
    document.getElementById(
      "synthesisOverview"
    );

  if (!container) return;

  container.innerHTML = "";

  if (!library?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Literatür sentezi oluşturmak için en az bir çalışma seçilmelidir.";

    container.appendChild(
      empty
    );

    return;
  }

  const totalStudies =
    library.length;

  const methods =
    Object.entries(
      methodCounts || {}
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  const dominantMethod =
    methods.length
      ? methods[0]
      : null;

  const validSamples =
    library.filter(
      (item) =>
        cleanValue(
          item.sample
        )
    );

  const validPurposes =
    library.filter(
      (item) =>
        cleanValue(
          item.purpose
        )
    );

  const validFindings =
    library.filter(
      (item) =>
        cleanValue(
          item.findings ||
          item.importantFindings ||
          item.results
        )
    );

  const parts = [];

  parts.push(
    `Seçilen literatür havuzunda toplam ${totalStudies} çalışma bulunmaktadır.`
  );

  if (dominantMethod) {
    const [
      method,
      count
    ] =
      dominantMethod;

    const percentage =
      Math.round(
        (
          count /
          totalStudies
        ) *
          100
      );

    parts.push(
      `En sık görülen yöntem "${method}" olup ${count} çalışmada (%${percentage}) kullanılmıştır.`
    );
  }

  if (
    methods.length > 1
  ) {
    const methodNames =
      methods
        .slice(0, 4)
        .map(
          ([method]) =>
            method
        )
        .join(", ");

    parts.push(
      `Literatürde birden fazla metodolojik yaklaşım bulunmaktadır: ${methodNames}.`
    );
  }

  if (
    commonKeywords?.length
  ) {
    const topKeywords =
      commonKeywords
        .slice(0, 5)
        .map(
          ([keyword]) =>
            getDisplayKeyword(
              keyword,
              library
            )
        );

    parts.push(
      `Çalışmaların ortak kavramsal odağı özellikle ${topKeywords.join(
        ", "
      )} kavramları etrafında yoğunlaşmaktadır.`
    );
  }

  if (
    Array.isArray(
      commonFindings
    ) &&
    commonFindings.length
  ) {
    parts.push(
      `${commonFindings.length} ortak bulgu veya bulgu teması tespit edilmiştir.`
    );
  }

  if (
    validSamples.length <
    totalStudies
  ) {
    parts.push(
      `${totalStudies - validSamples.length} çalışmada örneklem bilgisi açık biçimde belirlenemediği için örnekleme ilişkin karşılaştırmalar sınırlı olabilir.`
    );
  }

  if (
    validPurposes.length <
    totalStudies
  ) {
    parts.push(
      `${totalStudies - validPurposes.length} çalışmanın araştırma amacı yeterince açık olmadığı için amaç temelli sentezde eksik veri bulunmaktadır.`
    );
  }

  if (
    validFindings.length <
    totalStudies
  ) {
    parts.push(
      `${totalStudies - validFindings.length} çalışmada kullanılabilir bulgu bilgisi bulunmamaktadır.`
    );
  }

  parts.forEach(
    (text) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "comparison-item";

      item.textContent =
        text;

      container.appendChild(
        item
      );
    }
  );
}

// =====================================================
// 2. KANIT GÜCÜ
// =====================================================

function renderEvidenceStrength(
  library
) {
  const container =
    document.getElementById(
      "evidenceStrength"
    );

  if (!container) return;

  container.innerHTML = "";

  if (!library?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Kanıt gücü değerlendirilemedi.";

    container.appendChild(
      empty
    );

    return;
  }

  library.forEach(
    (item) => {
      let score = 0;

      const reasons = [];

      const method =
        normalizeMethodName(
          item
        );

      const sample =
        cleanValue(
          item.sample
        );

      const findings =
        cleanValue(
          item.findings ||
          item.importantFindings
        );

      const results =
        cleanValue(
          item.results
        );

      const limitation =
        cleanValue(
          item.limitations ||
          item.limitation
        );

      const dataCollection =
        cleanValue(
          item.dataCollection ||
          item.data_collection
        );

      const dataAnalysis =
        cleanValue(
          item.dataAnalysis ||
          item.data_analysis
        );

      if (
        method &&
        method !==
          "Belirlenemedi"
      ) {
        score += 2;

        reasons.push(
          "yöntem bilgisi mevcut"
        );
      }

      if (sample) {
        score += 2;

        reasons.push(
          "örneklem tanımlı"
        );
      }

      if (
        findings ||
        results
      ) {
        score += 2;

        reasons.push(
          "bulgular mevcut"
        );
      }

      if (
        dataCollection
      ) {
        score += 1;

        reasons.push(
          "veri toplama yöntemi mevcut"
        );
      }

      if (
        dataAnalysis
      ) {
        score += 1;

        reasons.push(
          "veri analizi bilgisi mevcut"
        );
      }

      if (
        limitation
      ) {
        score += 1;

        reasons.push(
          "sınırlılıklar belirtilmiş"
        );
      }

      let level =
        "Düşük";

      if (score >= 7) {
        level =
          "Güçlü";
      } else if (
        score >= 4
      ) {
        level =
          "Orta";
      }

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "comparison-item";

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        item.title ||
        item.fileName ||
        "Başlıksız çalışma";

      const rating =
        document.createElement(
          "p"
        );

      rating.innerHTML =
        `<b>Yerel kanıt skoru:</b> ${score}/9 · ${level}`;

      const explanation =
        document.createElement(
          "p"
        );

      explanation.textContent =
        reasons.length
          ? reasons.join(
              " · "
            )
          : "Değerlendirilebilir yeterli yapılandırılmış bilgi bulunamadı.";

      const warning =
        document.createElement(
          "small"
        );

      warning.textContent =
        "Bu puan çalışma kalitesinin kesin ölçümü değildir; Academic AI'da mevcut olan metodolojik bilgi kapsamını gösterir.";

      card.appendChild(
        title
      );

      card.appendChild(
        rating
      );

      card.appendChild(
        explanation
      );

      card.appendChild(
        warning
      );

      container.appendChild(
        card
      );
    }
  );
}

// =====================================================
// 3. YÖNTEM – BULGU İLİŞKİLERİ
// =====================================================

function renderMethodFindingRelations(
  library
) {
  const container =
    document.getElementById(
      "methodFindingRelations"
    );

  if (!container) return;

  container.innerHTML = "";

  if (!library?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Yöntem-bulgu ilişkisi oluşturulamadı.";

    container.appendChild(
      empty
    );

    return;
  }

  const groups = {};

  library.forEach(
    (item) => {
      const method =
        normalizeMethodName(
          item
        ) ||
        "Belirlenemedi";

      if (!groups[method]) {
        groups[method] = [];
      }

      groups[method].push(
        item
      );
    }
  );

  Object.entries(
    groups
  )
    .sort(
      (a, b) =>
        b[1].length -
        a[1].length
    )
    .forEach(
      ([
        method,
        studies
      ]) => {
        const card =
          document.createElement(
            "div"
          );

        card.className =
          "comparison-item";

        const title =
          document.createElement(
            "strong"
          );

        title.textContent =
          `${method} · ${studies.length} çalışma`;

        card.appendChild(
          title
        );

        const findings =
          studies
            .map(
              (item) =>
                cleanValue(
                  item.findings ||
                  item.importantFindings ||
                  item.results
                )
            )
            .filter(
              Boolean
            );

        if (
          !findings.length
        ) {
          const empty =
            document.createElement(
              "p"
            );

          empty.textContent =
            "Bu yöntem grubunda karşılaştırılabilir bulgu bilgisi bulunamadı.";

          card.appendChild(
            empty
          );
        } else {
          findings
            .slice(0, 4)
            .forEach(
              (
                finding,
                index
              ) => {
                const p =
                  document.createElement(
                    "p"
                  );

                const study =
                  studies[index];

                const studyTitle =
                  study?.title ||
                  study?.fileName ||
                  `Çalışma ${
                    index +
                    1
                  }`;

                const shortened =
                  finding.length >
                  350
                    ? finding.slice(
                        0,
                        347
                      ) + "..."
                    : finding;

                p.innerHTML =
                  `<b>${escapeAssistantHTML(
                    studyTitle
                  )}:</b> ${escapeAssistantHTML(
                    shortened
                  )}`;

                card.appendChild(
                  p
                );
              }
            );
        }

        container.appendChild(
          card
        );
      }
    );
}

// =====================================================
// 4. ARAŞTIRMA FIRSATLARI
// =====================================================

function renderResearchOpportunities(
  library,
  methodCounts,
  commonKeywords,
  commonFindings
) {
  const container =
    document.getElementById(
      "researchOpportunities"
    );

  if (!container) return;

  container.innerHTML = "";

  if (!library?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "comparison-item";

    empty.textContent =
      "Araştırma fırsatı oluşturmak için yeterli çalışma bulunmuyor.";

    container.appendChild(
      empty
    );

    return;
  }

  const opportunities =
    [];

  const total =
    library.length;

  const methods =
    Object.entries(
      methodCounts || {}
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  // -----------------------------------------------------
  // Yöntem yoğunlaşması
  // -----------------------------------------------------

  if (
    methods.length === 1 &&
    total >= 2
  ) {
    opportunities.push(
      `İncelenen çalışmaların tamamı ${methods[0][0]} yaklaşımına dayanmaktadır. Aynı araştırma probleminin farklı bir yöntemle incelenmesi metodolojik çeşitlilik sağlayabilir.`
    );
  } else if (
    methods.length
  ) {
    const [
      dominantMethod,
      dominantCount
    ] =
      methods[0];

    if (
      dominantCount /
        total >=
      0.6
    ) {
      opportunities.push(
        `Literatür ${dominantMethod} yönteminde yoğunlaşmaktadır (${dominantCount}/${total}). Daha az kullanılan yöntemlerle yapılacak çalışmalar mevcut bulguların farklı metodolojik tasarımlarla sınanmasına katkı sağlayabilir.`
      );
    }
  }

  // -----------------------------------------------------
  // Örneklem eksikliği
  // -----------------------------------------------------

  const missingSamples =
    library.filter(
      (item) =>
        !cleanValue(
          item.sample
        )
    ).length;

  if (
    missingSamples
  ) {
    opportunities.push(
      `${missingSamples} çalışmada açık örneklem bilgisi bulunmamaktadır. Gelecek araştırmalarda örneklem yapısının daha ayrıntılı raporlanması karşılaştırılabilirliği güçlendirebilir.`
    );
  }

  // -----------------------------------------------------
  // Sınırlılık eksikliği
  // -----------------------------------------------------

  const missingLimitations =
    library.filter(
      (item) =>
        !cleanValue(
          item.limitations ||
          item.limitation
        )
    ).length;

  if (
    missingLimitations >=
    Math.ceil(
      total / 2
    )
  ) {
    opportunities.push(
      `Çalışmaların önemli bir bölümünde açık sınırlılık bilgisi bulunmamaktadır. Yeni çalışmaların yöntemsel ve bağlamsal sınırlılıklarını açık biçimde raporlaması literatürdeki kanıtların değerlendirilmesini kolaylaştırabilir.`
    );
  }

  // -----------------------------------------------------
  // Ortak kavramlardan yeni bağlam önerisi
  // -----------------------------------------------------

  if (
    commonKeywords?.length
  ) {
    const topKeywords =
      commonKeywords
        .slice(0, 3)
        .map(
          ([keyword]) =>
            getDisplayKeyword(
              keyword,
              library
            )
        );

    if (
      topKeywords.length
    ) {
      opportunities.push(
        `${topKeywords.join(
          ", "
        )} literatürde tekrar eden temel kavramlardır. Bu kavramların farklı örneklem, ülke, kurum veya medya bağlamlarında karşılaştırılması yeni araştırma alanları oluşturabilir.`
      );
    }
  }

  // -----------------------------------------------------
  // Ortak bulgu yoksa
  // -----------------------------------------------------

  if (
    !commonFindings ||
    !commonFindings.length
  ) {
    if (
      total >= 2
    ) {
      opportunities.push(
        "Seçilen çalışmalar arasında güçlü biçimde tekrar eden ortak bir bulgu tespit edilmedi. Bu farklılığın örneklem, yöntem, dönem veya araştırma bağlamından kaynaklanıp kaynaklanmadığı ayrıca incelenebilir."
      );
    }
  } else {
    opportunities.push(
      "Tekrarlanan ortak bulguların farklı örneklemler ve yöntemlerle yeniden sınanması, bulguların genellenebilirliği hakkında daha güçlü kanıt sağlayabilir."
    );
  }

  // -----------------------------------------------------
  // Çok az çalışma
  // -----------------------------------------------------

  if (
    total < 3
  ) {
    opportunities.push(
      "Literatür havuzu henüz küçüktür. Araştırma boşluğu değerlendirmesinin güvenilirliğini artırmak için daha fazla ilgili çalışma eklenmesi önerilir."
    );
  }

  // -----------------------------------------------------
  // Hiç sinyal oluşmazsa
  // -----------------------------------------------------

  if (
    !opportunities.length
  ) {
    opportunities.push(
      "Mevcut verilerden belirgin bir araştırma fırsatı çıkarılamadı. Daha fazla çalışma veya daha ayrıntılı analiz verisi eklendiğinde yeni sinyaller oluşabilir."
    );
  }

  opportunities
    .slice(0, 7)
    .forEach(
      (
        opportunity,
        index
      ) => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "comparison-item research-opportunity";

        const number =
          document.createElement(
            "strong"
          );

        number.textContent =
          `Araştırma fırsatı ${
            index + 1
          }`;

        const text =
          document.createElement(
            "p"
          );

        text.textContent =
          opportunity;

        item.appendChild(
          number
        );

        item.appendChild(
          text
        );

        container.appendChild(
          item
        );
      }
    );
}
// =====================================================
// NOTLAR
// =====================================================

const noteInput =
  document.getElementById(
    "noteInput"
  );

const addNoteButton =
  document.getElementById(
    "addNoteButton"
  );

const notesList =
  document.getElementById(
    "notesList"
  );

function getNotes() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "academicAINotes"
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function setNotes(notes) {
  localStorage.setItem(
    "academicAINotes",
    JSON.stringify(notes)
  );

  renderNotes();

  updateAssistantSourceStatus();
}

function renderNotes() {
  if (!notesList) return;

  const notes =
    getNotes();

  notesList.innerHTML =
    "";

  if (!notes.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "empty-state";

    empty.innerHTML =
      `
      <strong>Henüz not yok</strong>
      <p>Araştırma sürecinde önemli gördüğün bilgileri buraya kaydedebilirsin.</p>
      `;

    notesList.appendChild(
      empty
    );

    return;
  }

  notes.forEach(
    (note) => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "note-card";

      const text =
        document.createElement(
          "p"
        );

      text.textContent =
        note.text;

      const date =
        document.createElement(
          "small"
        );

      date.textContent =
        new Date(
          note.createdAt
        ).toLocaleString(
          "tr-TR"
        );

      const remove =
        document.createElement(
          "button"
        );

      remove.type =
        "button";

      remove.className =
        "delete-note";

      remove.textContent =
        "×";

      remove.title =
        "Notu sil";

      remove.addEventListener(
        "click",
        () => {
          const updated =
            getNotes().filter(
              (item) =>
                item.id !==
                note.id
            );

          setNotes(updated);
        }
      );

      card.appendChild(
        text
      );

      card.appendChild(
        date
      );

      card.appendChild(
        remove
      );

      notesList.appendChild(
        card
      );
    }
  );
}

addNoteButton
  ?.addEventListener(
    "click",
    () => {
      const value =
        cleanValue(
          noteInput?.value
        );

      if (!value) return;

      const notes =
        getNotes();

      notes.unshift({
        id:
          Date.now(),

        text:
          value,

        createdAt:
          new Date()
            .toISOString()
      });

      setNotes(notes);

      noteInput.value =
        "";
    }
  );

// =====================================================
// TEZ / DOKTORA PROJESİ
// =====================================================

const thesisTitle =
  document.getElementById(
    "thesisTitle"
  );

const thesisProblem =
  document.getElementById(
    "thesisProblem"
  );

const thesisPurpose =
  document.getElementById(
    "thesisPurpose"
  );

const thesisQuestions =
  document.getElementById(
    "thesisQuestions"
  );

const thesisMethod =
  document.getElementById(
    "thesisMethod"
  );

const thesisNotes =
  document.getElementById(
    "thesisNotes"
  );

const saveThesisButton =
  document.getElementById(
    "saveThesisButton"
  );

const thesisSaveStatus =
  document.getElementById(
    "thesisSaveStatus"
  );

function getThesisProject() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "academicAIThesisProject"
      ) || "null"
    );
  } catch {
    return null;
  }
}

function setThesisProject(
  project
) {
  localStorage.setItem(
    "academicAIThesisProject",
    JSON.stringify(project)
  );
}

function restoreThesisProject() {
  const project =
    getThesisProject();

  if (!project) return;

  if (thesisTitle) {
    thesisTitle.value =
      project.title || "";
  }

  if (thesisProblem) {
    thesisProblem.value =
      project.problem || "";
  }

  if (thesisPurpose) {
    thesisPurpose.value =
      project.purpose || "";
  }

  if (thesisQuestions) {
    thesisQuestions.value =
      project.questions || "";
  }

  if (thesisMethod) {
    thesisMethod.value =
      project.method || "";
  }

  if (thesisNotes) {
    thesisNotes.value =
      project.notes || "";
  }
}

saveThesisButton
  ?.addEventListener(
    "click",
    () => {
      const project = {
        title:
          cleanValue(
            thesisTitle?.value
          ),

        problem:
          cleanValue(
            thesisProblem?.value
          ),

        purpose:
          cleanValue(
            thesisPurpose?.value
          ),

        questions:
          cleanValue(
            thesisQuestions?.value
          ),

        method:
          cleanValue(
            thesisMethod?.value
          ),

        notes:
          cleanValue(
            thesisNotes?.value
          ),

        updatedAt:
          new Date()
            .toISOString()
      };

      setThesisProject(
        project
      );

      if (
        thesisSaveStatus
      ) {
        thesisSaveStatus.hidden =
          false;

        thesisSaveStatus.textContent =
          "✓ Tez / doktora projesi kaydedildi.";
      }

      updateAssistantSourceStatus();
    }
  );

// =====================================================
// ATIF & KAYNAKÇA
// =====================================================

const citationInput =
  document.getElementById(
    "citationInput"
  );

const citationOutput =
  document.getElementById(
    "citationOutput"
  );

const citationAuthor =
  document.getElementById(
    "citationAuthor"
  );

const citationYear =
  document.getElementById(
    "citationYear"
  );

const citationTitle =
  document.getElementById(
    "citationTitle"
  );

const citationSource =
  document.getElementById(
    "citationSource"
  );

const citationDoi =
  document.getElementById(
    "citationDoi"
  );

function buildAPA7Citation() {
  const author =
    cleanValue(
      citationAuthor?.value
    );

  const year =
    cleanValue(
      citationYear?.value
    );

  const title =
    cleanValue(
      citationTitle?.value
    );

  const source =
    cleanValue(
      citationSource?.value
    );

  const doi =
    cleanValue(
      citationDoi?.value
    );

  if (
    !author &&
    !title
  ) {
    return "";
  }

  let citation = "";

  if (author) {
    citation += author;
  }

  if (year) {
    citation +=
      ` (${year}).`;
  } else if (author) {
    citation +=
      " (n.d.).";
  }

  if (title) {
    citation +=
      ` ${title}.`;
  }

  if (source) {
    citation +=
      ` ${source}.`;
  }

  if (doi) {
    const cleanDoi =
      doi
        .replace(
          /^https?:\/\/doi\.org\//i,
          ""
        )
        .replace(
          /^doi:\s*/i,
          ""
        );

    citation +=
      ` https://doi.org/${cleanDoi}`;
  }

  return citation.trim();
}

function renderCitationOutput() {
  if (!citationOutput) {
    return;
  }

  citationOutput.textContent =
    buildAPA7Citation() ||
    "Kaynak bilgilerini doldurduğunda APA 7 çıktısı burada görünecek.";
}

[
  citationAuthor,
  citationYear,
  citationTitle,
  citationSource,
  citationDoi
].forEach(
  (input) => {
    input?.addEventListener(
      "input",
      renderCitationOutput
    );
  }
);

citationInput
  ?.addEventListener(
    "input",
    () => {
      if (
        citationTitle &&
        !citationTitle.value
      ) {
        citationTitle.value =
          citationInput.value;
      }

      renderCitationOutput();
    }
  );

// =====================================================
// KOPYALAMA
// =====================================================

document
  .getElementById(
    "copyCitationButton"
  )
  ?.addEventListener(
    "click",
    async () => {
      const citation =
        buildAPA7Citation();

      if (!citation) {
        return;
      }

      try {
        await navigator
          .clipboard
          .writeText(
            citation
          );
      } catch {
        // panoya erişim engellenirse sessizce devam et
      }
    }
  );

// =====================================================
// AI ASİSTAN
// =====================================================

const assistantMessages =
  document.getElementById(
    "assistantMessages"
  );

const assistantInput =
  document.getElementById(
    "assistantInput"
  );

const assistantSend =
  document.getElementById(
    "assistantSend"
  );

const assistantSourceStatus =
  document.getElementById(
    "assistantSourceStatus"
  );

function getAssistantSources() {
  const library =
    getLibrary();

  const selected =
    selectedLiteratureIds
      .length
      ? library.filter(
          (item) =>
            selectedLiteratureIds.includes(
              getItemId(item)
            )
        )
      : library;

  return selected;
}

function updateAssistantSourceStatus() {
  if (
    !assistantSourceStatus
  ) {
    return;
  }

  const sources =
    getAssistantSources();

  const research =
    getResearchProject();

  const thesis =
    getThesisProject();

  const notes =
    getNotes();

  const parts = [];

  parts.push(
    `${sources.length} literatür kaynağı`
  );

  if (research) {
    parts.push(
      "araştırma çerçevesi"
    );
  }

  if (thesis) {
    parts.push(
      "tez projesi"
    );
  }

  if (notes.length) {
    parts.push(
      `${notes.length} not`
    );
  }

  assistantSourceStatus.textContent =
    parts.join(" · ");
}

function escapeAssistantHTML(
  value
) {
  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function appendAssistantMessage(
  role,
  text
) {
  if (
    !assistantMessages
  ) {
    return;
  }

  const message =
    document.createElement(
      "div"
    );

  message.className =
    `assistant-message ${role}`;

  message.innerHTML =
    escapeAssistantHTML(
      text
    ).replace(
      /\n/g,
      "<br>"
    );

  assistantMessages.appendChild(
    message
  );

  assistantMessages.scrollTop =
    assistantMessages.scrollHeight;
}

async function sendAssistantMessage() {
  const question =
    cleanValue(
      assistantInput?.value
    );

  if (!question) return;

  appendAssistantMessage(
    "user",
    question
  );

  if (assistantInput) {
    assistantInput.value =
      "";
  }

  if (assistantSend) {
    assistantSend.disabled =
      true;

    assistantSend.textContent =
      "Yanıtlanıyor…";
  }

  const sources =
    getAssistantSources();

  const research =
    getResearchProject();

  const thesis =
    getThesisProject();

  const notes =
    getNotes();

  try {
    const response =
      await fetch(
        "/api/assistant",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              question,
              sources,
              research,
              thesis,
              notes
            })
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch {
      throw new Error(
        "Academic AI sunucusundan geçerli bir yanıt alınamadı."
      );
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        cleanPublicErrorMessage(
          data.message ||
            "Yanıt oluşturulamadı."
        )
      );
    }

    appendAssistantMessage(
      "assistant",
      data.answer ||
        "Yanıt oluşturulamadı."
    );
  } catch (error) {
    appendAssistantMessage(
      "assistant",
      "Yanıt oluşturulamadı: " +
        cleanPublicErrorMessage(
          error.message
        )
    );
  } finally {
    if (assistantSend) {
      assistantSend.disabled =
        false;

      assistantSend.textContent =
        "Gönder";
    }

    assistantInput?.focus();
  }
}

assistantSend
  ?.addEventListener(
    "click",
    sendAssistantMessage
  );

assistantInput
  ?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        sendAssistantMessage();
      }
    }
  );

// =====================================================
// BAŞLANGIÇ
// =====================================================

loadLiteratureSelection();

restoreResearchProject();

restoreThesisProject();

renderLibrary();

renderLiteratureAnalysis();

renderNotes();

renderCitationOutput();

updateAssistantSourceStatus();

console.log(
  "✦ Kaynak tabanlı AI Asistan hazır."
);