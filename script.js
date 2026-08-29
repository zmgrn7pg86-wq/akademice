// =====================================================
// ACADEMIC AI — SCRIPT.JS — TOPLU GELİŞTİRME V11
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
          scheduleResearchAutoSave();
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
  scheduleResearchAutoSave();

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

      // Çerçeve oluşturulur oluşturulmaz kaydet.
      // Kullanıcı ayrıca Kaydet butonuna basmak zorunda kalmaz.
      persistResearchProject();

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
// ARAŞTIRMA PROJESİNİ OTOMATİK KAYDET
// BUTONA BAĞLI DEĞİL
// =====================================================

let researchAutoSaveTimer = null;

function persistResearchProject({
  showStatus = false
} = {}) {
  const project =
    collectResearchProject();

  if (!project.topic) {
    return false;
  }

  setResearchProject(project);

  if (showStatus && researchSaveStatus) {
    researchSaveStatus.hidden = false;
    researchSaveStatus.className =
      "research-status success";
    researchSaveStatus.textContent =
      "✓ Araştırma otomatik olarak kaydedildi. Literatür uygunluk kartları güncellendi.";
  }

  try {
    if (typeof renderLibrary === "function") {
      renderLibrary();
    }
  } catch {
    // Literatür arayüzü henüz hazır değilse uygulamayı durdurma.
  }

  try {
    if (typeof renderLiteratureAnalysis === "function") {
      renderLiteratureAnalysis();
    }
  } catch {
    // Analiz arayüzü henüz hazır değilse uygulamayı durdurma.
  }

  try {
    updateAssistantSourceStatus();
  } catch {
    // Asistan arayüzü henüz hazır değilse uygulamayı durdurma.
  }

  return true;
}

function scheduleResearchAutoSave() {
  clearTimeout(researchAutoSaveTimer);

  researchAutoSaveTimer = setTimeout(
    () => {
      persistResearchProject();
    },
    350
  );
}

[
  researchTopic,
  researchPurposeDraft,
  researchProblemDraft,
  mainResearchQuestion,
  researchScope,
  researchTargetGroup,
  turkishSearchTerms,
  englishSearchTerms
]
  .filter(Boolean)
  .forEach((element) => {
    element.addEventListener(
      "input",
      scheduleResearchAutoSave
    );

    element.addEventListener(
      "change",
      scheduleResearchAutoSave
    );
  });

researchQuestionsList
  ?.addEventListener(
    "input",
    scheduleResearchAutoSave
  );

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

      persistResearchProject({
        showStatus: true
      });
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

function getLiteratureFitTokens(value) {
  const normalized =
    normalizeSearchText(value);

  if (!normalized) {
    return [];
  }

  return [
    ...new Set(
      normalized
        .split(" ")
        .map((token) => token.trim())
        .filter(
          (token) =>
            token.length >= 3 &&
            !researchStopWords.has(token)
        )
    )
  ];
}

function buildLiteratureResearchFit(item) {
  const project = getResearchProject();

  if (!project?.topic) {
    return {
      level: "project-missing",
      title: "Araştırma konusu kaydedilmedi",
      reason: "Bu kaynağın araştırmana uygunluğunu değerlendirmek için önce Araştırma bölümünde konunu kaydet.",
      thesisUse: "Araştırma konusu kaydedildiğinde Academic AI bu kartı otomatik günceller.",
      matchedTerms: [],
      evidenceLabel: "Henüz karşılaştırma yapılmadı",
      comparisonLabel: "Karşılaştırma bekleniyor",
      fitScore: null,
      fitDimensions: []
    };
  }

  const projectCore = [project.topic, project.purpose, project.problem, project.mainQuestion].filter(Boolean).join(" ");
  const projectContext = [project.scope, ...(Array.isArray(project.questions) ? project.questions : []), ...(Array.isArray(project.keywords) ? project.keywords : []), project.turkishSearchTerms, project.englishSearchTerms].filter(Boolean).join(" ");

  const sourceCore = [item?.title, item?.purpose, item?.researchProblem, item?.summary].filter(Boolean).join(" ");
  const sourceAcademic = [item?.method, item?.researchDesign, item?.sample, ...(Array.isArray(item?.findings) ? item.findings.slice(0, 5) : []), ...(Array.isArray(item?.keywords) ? item.keywords : [])].filter(Boolean).join(" ");
  const sourceMeta = [item?.title, item?.meta?.source, ...(Array.isArray(item?.keywords) ? item.keywords : [])].filter(Boolean).join(" ");

  const projectCoreTokens = getLiteratureFitTokens(projectCore);
  const projectAllTokens = [...new Set([...projectCoreTokens, ...getLiteratureFitTokens(projectContext)])];
  const sourceCoreTokens = new Set(getLiteratureFitTokens(sourceCore));
  const sourceAcademicTokens = new Set(getLiteratureFitTokens(sourceAcademic));
  const sourceAllTokens = new Set(getLiteratureFitTokens([sourceCore, sourceAcademic, sourceMeta].join(" ")));

  const matchedTerms = projectAllTokens.filter((token) => sourceAllTokens.has(token)).slice(0, 10);
  const coreMatches = projectCoreTokens.filter((token) => sourceCoreTokens.has(token) || sourceAcademicTokens.has(token));
  const academicMatches = projectAllTokens.filter((token) => sourceAcademicTokens.has(token));

  const hasRichAnalysis = Boolean(cleanValue(item?.purpose) || cleanValue(item?.summary) || cleanValue(item?.method) || cleanValue(item?.researchDesign) || cleanValue(item?.sample) || (Array.isArray(item?.findings) && item.findings.length));

  // Konu/amaç/problem/soru eşleşmeleri daha yüksek ağırlık taşır.
  const score = coreMatches.length * 2 + academicMatches.length + Math.min(matchedTerms.length, 4);

  // Bu yüzde bilimsel geçerlilik puanı değildir; kullanıcıya yerel eşleşmenin
  // gücünü daha anlaşılır göstermek için kullanılan şeffaf bir uyum göstergesidir.
  const fitScore = Math.max(0, Math.min(100, Math.round(
    (Math.min(coreMatches.length, 6) / 6) * 50 +
    (Math.min(academicMatches.length, 6) / 6) * 30 +
    (Math.min(matchedTerms.length, 8) / 8) * 20
  )));

  const fitDimensions = [
    { label: "Konu / amaç / problem", matched: coreMatches.length },
    { label: "Yöntem / örneklem / bulgular", matched: academicMatches.length },
    { label: "Ortak kavramlar", matched: matchedTerms.length }
  ];

  let level = "low";
  let title = "Uygunluk henüz net değil";
  if (score >= 10 && matchedTerms.length >= 3) {
    level = "high";
    title = "Araştırmanla güçlü akademik eşleşme var";
  } else if (score >= 5 && matchedTerms.length >= 2) {
    level = "medium";
    title = "Araştırmanla ilişkili görünüyor";
  } else if (matchedTerms.length >= 1) {
    level = "possible";
    title = "Araştırmanla olası bir bağlantı var";
  }

  const reason = matchedTerms.length
    ? `Ortak kavramlar: ${matchedTerms.join(", ")}. Değerlendirme; kayıtlı araştırmanın konusu, amacı, problemi, soruları ve anahtar kavramları ile kaynağın mevcut akademik alanlarının karşılaştırılmasına dayanır.`
    : "Kayıtlı araştırmanın konusu, amacı, problemi, soruları ve anahtar kavramları ile bu kaynağın mevcut alanlarında belirgin bir ortak kavram bulunamadı. Dolaylı veya kuramsal katkı için içerik ayrıca incelenmelidir.";

  const usage = [];
  if (matchedTerms.length) usage.push(`Literatür taramasında ${matchedTerms.slice(0, 3).join(", ")} kavramlarıyla ilişkili çalışma olarak incelenebilir.`);
  if (cleanValue(item?.method)) usage.push(`Yöntem bölümünde ${shorten(cleanValue(item.method), 90)} yaklaşımıyla karşılaştırma yapmak için kullanılabilir.`);
  if (Array.isArray(item?.findings) && item.findings.length) usage.push("Tartışma bölümünde kendi bulgularınla karşılaştırılabilecek bir kaynak olabilir.");
  if (!hasRichAnalysis) usage.push("Bu kayıtta bibliyografik metadata ağırlıklı bilgi var; tezde kullanmadan önce özetini veya PDF içeriğini analiz etmek gerekir.");
  if (!usage.length) usage.push("Tezde hangi bölümde kullanılacağına karar vermek için önce kaynağın özet/PDF içeriğini incele.");

  return {
    level,
    title,
    reason,
    thesisUse: usage.join(" "),
    matchedTerms,
    evidenceLabel: hasRichAnalysis ? "Araştırma çerçevesi + mevcut analiz alanları + metadata" : "Araştırma çerçevesi + metadata tabanlı ön değerlendirme",
    comparisonLabel: "KAYITLI ARAŞTIRMANLA KARŞILAŞTIRILDI",
    fitScore,
    fitDimensions
  };
}

function createLiteratureResearchFitCard(item) {
  const fit = buildLiteratureResearchFit(item);
  const box = document.createElement("div");
  box.className = "library-finding-preview";

  const label = document.createElement("span");
  label.textContent = fit.comparisonLabel || "KAYITLI ARAŞTIRMANLA KARŞILAŞTIRILDI";
  label.style.fontWeight = "800";
  label.style.letterSpacing = "0.04em";

  const explanation = document.createElement("small");
  explanation.textContent = fit.level === "project-missing"
    ? "Önce Araştırma bölümünde araştırma konunu kaydet."
    : "Bu kaynak, Araştırma bölümünde kaydettiğin konu, amaç, problem, araştırma soruları ve anahtar kavramlarla karşılaştırıldı.";
  explanation.style.display = "block";
  explanation.style.marginTop = "5px";
  explanation.style.opacity = "0.78";

  const heading = document.createElement("strong");
  heading.textContent = fit.title;
  heading.style.display = "block";
  heading.style.marginTop = "9px";

  const scoreLine = document.createElement("small");
  scoreLine.style.display = "block";
  scoreLine.style.marginTop = "5px";
  scoreLine.style.fontWeight = "700";
  scoreLine.textContent = fit.fitScore == null
    ? "Uyum göstergesi: hesaplanmadı"
    : `Uyum göstergesi: %${fit.fitScore} · Bu oran akademik kalite puanı değildir.`;

  const reason = document.createElement("p");
  reason.textContent = fit.reason;

  const useLabel = document.createElement("span");
  useLabel.textContent = "BU KAYNAĞI NEDEN / NEREDE KULLANABİLİRİM?";
  useLabel.style.display = "block";
  useLabel.style.marginTop = "10px";

  const thesisUse = document.createElement("p");
  thesisUse.textContent = fit.thesisUse;

  const evidence = document.createElement("small");
  evidence.textContent = `Dayanak: ${fit.evidenceLabel}. AI kredisi kullanılmadı.`;
  evidence.style.display = "block";
  evidence.style.marginTop = "8px";
  evidence.style.opacity = "0.72";

  box.appendChild(label);
  box.appendChild(explanation);
  box.appendChild(heading);
  box.appendChild(scoreLine);
  box.appendChild(reason);
  box.appendChild(useLabel);
  box.appendChild(thesisUse);
  box.appendChild(evidence);
  return box;
}

function renderActiveResearchBanner(section) {
  section.querySelector("#activeResearchLiteratureBanner")?.remove();
  const project = getResearchProject();
  const banner = document.createElement("div");
  banner.id = "activeResearchLiteratureBanner";
  banner.style.margin = "0 0 18px";
  banner.style.padding = "16px 18px";
  banner.style.border = "1px solid rgba(21,42,37,.18)";
  banner.style.borderRadius = "14px";
  banner.style.background = "rgba(255,255,255,.58)";

  const eyebrow = document.createElement("span");
  eyebrow.textContent = project?.topic ? "🎯 AKTİF ARAŞTIRMAM" : "🎯 AKTİF ARAŞTIRMA YOK";
  eyebrow.style.fontSize = "11px";
  eyebrow.style.fontWeight = "800";
  eyebrow.style.letterSpacing = ".08em";

  const title = document.createElement("strong");
  title.textContent = project?.topic || "Kaynak uygunluğunu karşılaştırmak için Araştırma bölümünde konunu kaydet.";
  title.style.display = "block";
  title.style.marginTop = "7px";
  title.style.fontSize = "15px";

  const info = document.createElement("small");
  info.textContent = project?.topic
    ? "Aşağıdaki kaynakların uygunluğu bu kayıtlı araştırma çerçevesine göre değerlendiriliyor."
    : "Araştırma kaydedildiğinde bu alan otomatik güncellenir.";
  info.style.display = "block";
  info.style.marginTop = "5px";
  info.style.opacity = ".72";

  banner.appendChild(eyebrow);
  banner.appendChild(title);
  banner.appendChild(info);

  const toolbar = document.getElementById("literatureToolbar");
  const empty = document.getElementById("literatureList");
  const anchor = toolbar || empty || section.firstChild;
  if (anchor && anchor.parentNode === section) section.insertBefore(banner, anchor);
  else section.prepend(banner);
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

  renderActiveResearchBanner(section);

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

      content.appendChild(
        createLiteratureResearchFitCard(
          item
        )
      );

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
      "activeResearchAnalysisCard"
    )
  ) {
    const researchCard =
      document.createElement(
        "article"
      );

    researchCard.id =
      "activeResearchAnalysisCard";

    researchCard.className =
      "analysis-insight-card wide-analysis-card";

    researchCard.innerHTML = `
      <span class="eyebrow">
        🎯 AKTİF ARAŞTIRMA × LİTERATÜR
      </span>

      <h3>
        Seçili kaynaklar araştırmanı ne kadar destekliyor?
      </h3>

      <p class="analysis-help">
        Bu bölüm seçtiğin kaynakları Araştırma bölümünde kaydettiğin
        konu, amaç, problem, araştırma soruları ve anahtar kavramlarla
        karşılaştırır. Ayrıca araştırma sorularının seçili kaynaklarda kavramsal karşılık bulup bulmadığını gösterir. Sonuçlar yerel ve kural tabanlıdır; AI kredisi kullanılmaz.
      </p>

      <div
        id="activeResearchAnalysisList"
        class="comparison-list"
      ></div>
    `;

    content.appendChild(
      researchCard
    );
  }
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

function getAnalyzedLiterature(library = getLibrary()) {
  return (Array.isArray(library) ? library : []).filter(
    (item) => !item?.suggestedSource
  );
}

// =====================================================
// KAYNAK EKSİKSE AKADEMİK KAYNAK ÖNERİSİ
// OpenAlex metadata araması — AI kredisi kullanmaz
// =====================================================

const addManualSourceButton =
  document.getElementById(
    "addManualSourceButton"
  );

const addManualSourceFromLibrary =
  document.getElementById(
    "addManualSourceFromLibrary"
  );

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

function getSourceSuggestionBaseSource() {
  const library = getLibrary();
  const analyzedLibrary = getAnalyzedLiterature(library);

  return analyzedLibrary[0] || library[0] || {};
}

function buildSourceSuggestionQuery() {
  const first = getSourceSuggestionBaseSource();

  const keywords = Array.isArray(first.keywords)
    ? first.keywords.slice(0, 5).join(" ")
    : "";

  return cleanValue(
    [first.title, keywords]
      .filter(Boolean)
      .join(" ")
  );
}

const sourceSuggestionStopWords = new Set([
  "ve", "ile", "bir", "bu", "şu", "için", "olan", "olarak",
  "the", "and", "for", "with", "from", "into", "using", "use",
  "study", "research", "analysis", "effects", "effect", "case"
]);

function getSourceSuggestionTokens(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 4 &&
        !sourceSuggestionStopWords.has(token)
    );
}

function buildSourceSuggestionReason(source) {
  const base = getSourceSuggestionBaseSource();

  const baseKeywords = Array.isArray(base?.keywords)
    ? base.keywords
    : [];

  const sourceKeywords = Array.isArray(source?.keywords)
    ? source.keywords
    : [];

  const baseTokens = new Set(
    getSourceSuggestionTokens(
      [
        base?.title,
        ...baseKeywords
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  const sourceTokens = new Set(
    getSourceSuggestionTokens(
      [
        source?.title,
        ...sourceKeywords
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  const overlap = [...sourceTokens]
    .filter((token) => baseTokens.has(token))
    .slice(0, 5);

  const reasons = [];

  if (overlap.length) {
    reasons.push(
      `Ortak kavramlar: ${overlap.join(", ")}.`
    );
  }

  const baseYear = Number(
    base?.meta?.year || base?.year || 0
  );

  const sourceYear = Number(source?.year || 0);

  if (
    baseYear &&
    sourceYear &&
    sourceYear > baseYear
  ) {
    reasons.push(
      `Mevcut temel kaynağından daha güncel (${sourceYear}).`
    );
  }

  if (source?.openAccess) {
    reasons.push(
      "Açık erişim bilgisi bulunduğu için kaynağa ulaşmak daha kolay olabilir."
    );
  }

  const citedByCount = Number(
    source?.citedByCount || 0
  );

  if (citedByCount > 0) {
    reasons.push(
      `OpenAlex kaydında ${citedByCount} atıf görünüyor; bu sayı bilimsel kalite puanı değildir.`
    );
  }

  if (!reasons.length) {
    reasons.push(
      "Başlık ve bibliyografik benzerlik nedeniyle aday kaynak olarak getirildi. Uygunluğunu kaynağı açarak doğrulamalısın."
    );
  }

  return reasons.slice(0, 3);
}

function getSourceSuggestionScore(source) {
  const base = getSourceSuggestionBaseSource();

  const baseTokens = new Set(
    getSourceSuggestionTokens(
      [
        base?.title,
        ...(Array.isArray(base?.keywords)
          ? base.keywords
          : [])
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  const sourceTokens = getSourceSuggestionTokens(
    [
      source?.title,
      ...(Array.isArray(source?.keywords)
        ? source.keywords
        : [])
    ]
      .filter(Boolean)
      .join(" ")
  );

  const overlapCount = sourceTokens.filter(
    (token) => baseTokens.has(token)
  ).length;

  return (
    overlapCount * 10 +
    (source?.openAccess ? 2 : 0) +
    Math.min(
      5,
      Math.log10(
        Number(source?.citedByCount || 0) + 1
      ) * 2
    )
  );
}

function prepareSourceSuggestions(sources) {
  const library = getLibrary();

  return (Array.isArray(sources) ? sources : [])
    .filter((source) => {
      const sourceDoi = cleanValue(source?.doi)
        .toLowerCase();

      const sourceTitle = normalizeSearchText(
        source?.title
      );

      return !library.some((item) => {
        const itemDoi = cleanValue(
          item?.meta?.doi || item?.doi
        ).toLowerCase();

        if (
          itemDoi &&
          sourceDoi &&
          itemDoi === sourceDoi
        ) {
          return true;
        }

        return (
          sourceTitle &&
          normalizeSearchText(item?.title) ===
            sourceTitle
        );
      });
    })
    .map((source) => ({
      ...source,
      recommendationReasons:
        buildSourceSuggestionReason(source),
      recommendationScore:
        getSourceSuggestionScore(source)
    }))
    .sort(
      (a, b) =>
        b.recommendationScore -
        a.recommendationScore
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

    const reasonBox = document.createElement("div");
    reasonBox.className = "source-suggestion-reason";
    reasonBox.style.marginTop = "12px";
    reasonBox.style.padding = "12px 14px";
    reasonBox.style.border = "1px solid rgba(71, 109, 93, 0.22)";
    reasonBox.style.borderRadius = "12px";
    reasonBox.style.background = "rgba(71, 109, 93, 0.06)";

    const reasonTitle = document.createElement("strong");
    reasonTitle.textContent = "Neden önerildi?";
    reasonBox.appendChild(reasonTitle);

    const reasonList = document.createElement("ul");
    reasonList.style.margin = "8px 0 0";
    reasonList.style.paddingLeft = "18px";

    const reasons = Array.isArray(source.recommendationReasons)
      ? source.recommendationReasons
      : buildSourceSuggestionReason(source);

    reasons.forEach((reason) => {
      const item = document.createElement("li");
      item.textContent = reason;
      item.style.marginTop = "4px";
      reasonList.appendChild(item);
    });

    reasonBox.appendChild(reasonList);

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
        add.textContent = "✓ Kaynak adayı kaydedildi";
      } else {
        add.disabled = true;
        add.textContent = "Zaten Literatüründe";
      }
    });

    actions.appendChild(add);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(badges);
    card.appendChild(reasonBox);
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

    const preparedSources =
      prepareSourceSuggestions(
        data.sources || []
      );

    renderSourceSuggestions(
      preparedSources
    );

    if (sourceSuggestionStatus) {
      sourceSuggestionStatus.textContent =
        `${preparedSources.length} ilgili akademik kaynak bulundu. Öneri nedenlerini inceleyip eklemek istediğini sen seçebilirsin.`;
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
// AKILLI MANUEL KAYNAK EKLEME
// ÜCRETSİZ METADATA ARAMASI + İSTEĞE BAĞLI AYRINTI
// =====================================================

let selectedManualSourceCandidate = null;
let lastManualSourceSearchCriteria = null;

function openManualSourceForm() {
  const existingModal =
    document.getElementById(
      "manualSourceModal"
    );

  if (existingModal) {
    existingModal.remove();
  }

  selectedManualSourceCandidate = null;

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "manualSourceModal";

  modal.style.position =
    "fixed";

  modal.style.inset =
    "0";

  modal.style.background =
    "rgba(0,0,0,0.45)";

  modal.style.zIndex =
    "9999";

  modal.style.display =
    "flex";

  modal.style.alignItems =
    "center";

  modal.style.justifyContent =
    "center";

  modal.style.padding =
    "24px";

  const panel =
    document.createElement(
      "div"
    );

  panel.style.width =
    "min(760px, 100%)";

  panel.style.maxHeight =
    "90vh";

  panel.style.overflowY =
    "auto";

  panel.style.background =
    "#ffffff";

  panel.style.borderRadius =
    "18px";

  panel.style.padding =
    "24px";

  panel.style.boxShadow =
    "0 24px 60px rgba(0,0,0,0.22)";

  panel.innerHTML = `
    <div
      style="
        display:flex;
        justify-content:space-between;
        gap:16px;
        align-items:flex-start;
        margin-bottom:20px;
      "
    >
      <div>
        <span class="eyebrow">
          AKILLI KAYNAK EKLE
        </span>

        <h2
          style="
            margin:6px 0 6px;
          "
        >
          Kaynağı bul, bilgileri otomatik tamamla
        </h2>

        <p
          style="
            margin:0;
            color:#66736f;
          "
        >
          Bildiğin kadarını yaz. Başlık, yazar, yıl veya DOI yeterli olabilir.
        </p>
      </div>

      <button
        id="closeManualSourceModal"
        type="button"
        class="secondary-button"
      >
        Kapat
      </button>
    </div>

    <div
      style="
        border:1px solid rgba(71,109,93,0.18);
        border-radius:16px;
        padding:18px;
        margin-bottom:18px;
        background:rgba(71,109,93,0.04);
      "
    >
      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        "
      >

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Çalışmanın başlığı
          </strong>

          <input
            id="manualSourceTitle"
            type="text"
            placeholder="Biliyorsan makale veya tez başlığını yaz"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label>
          <strong>
            Yazar / Yazarlar
          </strong>

          <input
            id="manualSourceAuthors"
            type="text"
            placeholder="Örn. Ahmet Yılmaz"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label>
          <strong>
            Yıl
          </strong>

          <input
            id="manualSourceYear"
            type="text"
            placeholder="Örn. 2024"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            DOI
          </strong>

          <input
            id="manualSourceDoi"
            type="text"
            placeholder="Örn. 10.1234/abcd.2024.001"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

      </div>

      <button
        id="findManualSourceButton"
        type="button"
        class="primary"
        style="
          width:100%;
          margin-top:16px;
        "
      >
        ✦ Kaynağı Bul ve Bilgileri Tamamla
      </button>

      <div
        id="manualSourceSearchStatus"
        class="status"
        hidden
        style="
          margin-top:12px;
        "
      ></div>

      <div
        id="manualSourceSearchResults"
        style="
          margin-top:14px;
        "
      ></div>
    </div>

    <details
      id="manualSourceDetails"
      style="
        border:1px solid rgba(71,109,93,0.16);
        border-radius:16px;
        padding:16px;
      "
    >
      <summary
        style="
          cursor:pointer;
          font-weight:700;
        "
      >
        Ayrıntıları kendim eklemek istiyorum
      </summary>

      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
          margin-top:16px;
        "
      >

        <label>
          <strong>
            Kaynak / Dergi
          </strong>

          <input
            id="manualSourceJournal"
            type="text"
            placeholder="Dergi veya yayınevi"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label>
          <strong>
            URL
          </strong>

          <input
            id="manualSourceUrl"
            type="text"
            placeholder="https://..."
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Araştırmanın amacı
          </strong>

          <textarea
            id="manualSourcePurpose"
            rows="3"
            placeholder="Biliyorsan yazabilirsin."
            style="
              width:100%;
              margin-top:6px;
            "
          ></textarea>
        </label>

        <label>
          <strong>
            Yöntem
          </strong>

          <input
            id="manualSourceMethod"
            type="text"
            placeholder="Nitel, nicel, karma..."
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label>
          <strong>
            Araştırma deseni
          </strong>

          <input
            id="manualSourceDesign"
            type="text"
            placeholder="Durum çalışması, tarama..."
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Örneklem / Çalışma grubu
          </strong>

          <input
            id="manualSourceSample"
            type="text"
            placeholder="Biliyorsan yazabilirsin."
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Önemli bulgular
          </strong>

          <textarea
            id="manualSourceFindings"
            rows="4"
            placeholder="Her bulguyu ayrı satıra yazabilirsin."
            style="
              width:100%;
              margin-top:6px;
            "
          ></textarea>
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Sınırlılıklar
          </strong>

          <textarea
            id="manualSourceLimitations"
            rows="3"
            placeholder="Her sınırlılığı ayrı satıra yazabilirsin."
            style="
              width:100%;
              margin-top:6px;
            "
          ></textarea>
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Araştırmacının önerileri
          </strong>

          <textarea
            id="manualSourceRecommendations"
            rows="3"
            placeholder="Her öneriyi ayrı satıra yazabilirsin."
            style="
              width:100%;
              margin-top:6px;
            "
          ></textarea>
        </label>

        <label
          style="
            grid-column:1 / -1;
          "
        >
          <strong>
            Anahtar kavramlar
          </strong>

          <input
            id="manualSourceKeywords"
            type="text"
            placeholder="yapay zekâ, gazetecilik, etik"
            style="
              width:100%;
              margin-top:6px;
            "
          >
        </label>

      </div>
    </details>

    <div
      id="manualSourceStatus"
      class="status"
      hidden
      style="
        margin-top:16px;
      "
    ></div>

    <div
      style="
        display:flex;
        justify-content:flex-end;
        gap:10px;
        margin-top:20px;
      "
    >
      <button
        id="cancelManualSourceButton"
        type="button"
        class="secondary-button"
      >
        Vazgeç
      </button>

      <button
        id="saveManualSourceButton"
        type="button"
        class="primary"
      >
        ＋ Literatürüme Kaydet
      </button>
    </div>
  `;

  modal.appendChild(
    panel
  );

  document.body.appendChild(
    modal
  );

  const closeModal = () => {
    modal.remove();
  };

  document
    .getElementById(
      "closeManualSourceModal"
    )
    ?.addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById(
      "cancelManualSourceButton"
    )
    ?.addEventListener(
      "click",
      closeModal
    );

  modal.addEventListener(
    "click",
    (event) => {
      if (
        event.target === modal
      ) {
        closeModal();
      }
    }
  );

  document
    .getElementById(
      "findManualSourceButton"
    )
    ?.addEventListener(
      "click",
      findManualSource
    );

  document
    .getElementById(
      "saveManualSourceButton"
    )
    ?.addEventListener(
      "click",
      saveManualSource
    );
}

function buildManualSourceQuery() {
  const title =
    cleanValue(
      document.getElementById(
        "manualSourceTitle"
      )?.value
    );

  const authors =
    cleanValue(
      document.getElementById(
        "manualSourceAuthors"
      )?.value
    );

  const year =
    cleanValue(
      document.getElementById(
        "manualSourceYear"
      )?.value
    );

  const doi =
    cleanValue(
      document.getElementById(
        "manualSourceDoi"
      )?.value
    );

  return cleanValue(
    [
      title,
      authors,
      year,
      doi
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function findManualSource() {
  const title =
    cleanValue(
      document.getElementById(
        "manualSourceTitle"
      )?.value
    );

  const authors =
    cleanValue(
      document.getElementById(
        "manualSourceAuthors"
      )?.value
    );

  const year =
    cleanValue(
      document.getElementById(
        "manualSourceYear"
      )?.value
    );

  const doi =
    cleanValue(
      document.getElementById(
        "manualSourceDoi"
      )?.value
    );

  const query =
    cleanValue(
      [
        title,
        authors,
        year,
        doi
      ]
        .filter(Boolean)
        .join(" ")
    );

  const status =
    document.getElementById(
      "manualSourceSearchStatus"
    );

  const resultsBox =
    document.getElementById(
      "manualSourceSearchResults"
    );

  const button =
    document.getElementById(
      "findManualSourceButton"
    );

  if (!query) {
    if (status) {
      status.hidden = false;
      status.textContent =
        "Kaynağı aramak için yalnızca bildiğin bir bilgiyi yazman yeterli: başlık, yazar, yıl veya DOI.";
    }

    return;
  }

  if (year) {
    const numericYear =
      Number(year);

    const maximumYear =
      new Date().getFullYear() + 1;

    if (
      !/^\d{4}$/.test(year) ||
      numericYear < 1900 ||
      numericYear > maximumYear
    ) {
      if (status) {
        status.hidden = false;
        status.textContent =
          `Yıl alanına 1900–${maximumYear} arasında dört haneli bir yıl yaz.`;
      }

      return;
    }
  }

  const onlyYear =
    Boolean(year) &&
    !title &&
    !authors &&
    !doi;

  const onlyAuthor =
    Boolean(authors) &&
    !title &&
    !year &&
    !doi;

  const onlyTitle =
    Boolean(title) &&
    !authors &&
    !year &&
    !doi;

  const onlyDoi =
    Boolean(doi) &&
    !title &&
    !authors &&
    !year;

  lastManualSourceSearchCriteria = {
    title,
    authors,
    year,
    doi,
    onlyYear,
    onlyAuthor,
    onlyTitle,
    onlyDoi
  };

  if (button) {
    button.disabled = true;
    button.textContent =
      "Kaynak aranıyor…";
  }

  if (status) {
    status.hidden = false;

    if (onlyYear) {
      status.textContent =
        `${year} yılında yayımlanan çalışmalar aranıyor. Sonuçlar atıf sayısı yüksek olanlardan başlanarak getirilecek. AI kredisi kullanılmaz.`;
    } else if (onlyDoi) {
      status.textContent =
        "DOI ile kesin bibliyografik kayıt aranıyor. AI kredisi kullanılmaz.";
    } else if (onlyAuthor) {
      status.textContent =
        "Yazar bilgisiyle akademik kayıtlar aranıyor. AI kredisi kullanılmaz.";
    } else if (onlyTitle) {
      status.textContent =
        "Başlık bilgisiyle en yakın akademik kayıtlar aranıyor. AI kredisi kullanılmaz.";
    } else {
      status.textContent =
        "Verdiğin bilgiler birlikte kullanılarak akademik kayıt aranıyor. AI kredisi kullanılmaz.";
    }
  }

  if (resultsBox) {
    resultsBox.innerHTML = "";
  }

  try {
    const response =
      await fetch(
        "/api/source-suggestions",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              query,
              title,
              authors,
              year,
              doi,
              researchTopic: cleanValue(
                getResearchProject()?.topic ||
                researchTopic?.value
              )
            })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
        "Kaynak araması başarısız."
      );
    }

    const sources =
      Array.isArray(
        data.sources
      )
        ? data.sources
        : [];

    renderManualSourceResults(
      sources
    );

    if (status) {
      if (!sources.length) {
        status.textContent =
          "Uygun akademik kayıt bulunamadı. Bildiğin bilgileri yine de manuel olarak kaydedebilirsin.";
      } else if (onlyYear) {
        status.textContent =
          `${year} yılı için ${sources.length} akademik kayıt bulundu. Bu geniş bir aramadır; atıf sayısı ve başlığı inceleyerek doğru kaynağı seç.`;
      } else if (onlyDoi) {
        status.textContent =
          `${sources.length} DOI eşleşmesi bulundu. Kaydetmeden önce başlık ve yazar bilgisini kontrol et.`;
      } else {
        status.textContent =
          `${sources.length} olası akademik kayıt bulundu. Eşleşme nedenlerini inceleyip doğru kaynağı seç.`;
      }
    }
  } catch (error) {
    if (status) {
      status.hidden =
        false;

      status.textContent =
        error.message ||
        "Kaynak aranırken hata oluştu.";
    }
  } finally {
    if (button) {
      button.disabled =
        false;

      button.textContent =
        "✦ Kaynağı Bul ve Bilgileri Tamamla";
    }
  }
}

function renderManualSourceResults(
  sources
) {
  const resultsBox =
    document.getElementById(
      "manualSourceSearchResults"
    );

  if (!resultsBox) {
    return;
  }

  resultsBox.innerHTML = "";

  if (
    !Array.isArray(sources) ||
    !sources.length
  ) {
    return;
  }

  const renderSourceCard = (source) => {
    const card = document.createElement("article");
    card.style.border = "1px solid rgba(71,109,93,0.18)";
    card.style.borderRadius = "14px";
    card.style.padding = "14px";
    card.style.marginTop = "10px";

    const confidence = document.createElement("div");
    confidence.style.display = "flex";
    confidence.style.alignItems = "center";
    confidence.style.gap = "8px";
    confidence.style.flexWrap = "wrap";
    confidence.style.marginBottom = "8px";

    const score = Number(source.matchScore);
    const isOnlyYearSearch =
      Boolean(
        lastManualSourceSearchCriteria
          ?.onlyYear
      );

    const level = cleanValue(source.matchLevel) ||
      (Number.isFinite(score) ? (score >= 75 ? "Güçlü eşleşme" : score >= 45 ? "Olası eşleşme" : "Zayıf eşleşme") : "Olası kayıt");

    const levelBadge = document.createElement("span");

    levelBadge.textContent =
      isOnlyYearSearch
        ? `${source.year || lastManualSourceSearchCriteria?.year || "Yıl"} · Geniş yıl araması`
        : Number.isFinite(score)
          ? `%${Math.round(score)} · ${level}`
          : level;
    levelBadge.style.fontSize = "12px";
    levelBadge.style.fontWeight = "700";
    levelBadge.style.padding = "5px 9px";
    levelBadge.style.borderRadius = "999px";
    levelBadge.style.background = "rgba(71,109,93,0.10)";
    levelBadge.style.color = "#315d4c";
    confidence.appendChild(levelBadge);

    if (source.isLikelyReview) {
      const reviewBadge = document.createElement("span");
      reviewBadge.textContent = "İkincil / inceleme kaydı olabilir";
      reviewBadge.style.fontSize = "12px";
      reviewBadge.style.padding = "5px 9px";
      reviewBadge.style.borderRadius = "999px";
      reviewBadge.style.background = "rgba(156,106,42,0.10)";
      reviewBadge.style.color = "#80571f";
      confidence.appendChild(reviewBadge);
    }

    const title = document.createElement("strong");
    title.textContent = source.title || "Başlıksız çalışma";

    const meta = document.createElement("p");
    meta.style.margin = "6px 0";
    meta.style.color = "#66736f";
    meta.textContent = [source.authors, source.year, source.source].filter(Boolean).join(" · ") || "Bibliyografik bilgi sınırlı";

    const reasons = Array.isArray(source.matchReasons) ? source.matchReasons.filter(Boolean) : [];
    if (reasons.length) {
      const reasonText = document.createElement("p");
      reasonText.style.margin = "4px 0 8px";
      reasonText.style.fontSize = "12px";
      reasonText.style.color = "#52615c";
      reasonText.textContent = reasons.join(" · ");
      card.appendChild(confidence);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(reasonText);
    } else {
      card.appendChild(confidence);
      card.appendChild(title);
      card.appendChild(meta);
    }

    const badges = document.createElement("div");
    badges.style.display = "flex";
    badges.style.flexWrap = "wrap";
    badges.style.gap = "6px";

    if (source.doi) {
      const doiBadge = document.createElement("span");
      doiBadge.textContent = `DOI: ${source.doi}`;
      doiBadge.style.fontSize = "12px";
      badges.appendChild(doiBadge);
    }

    if (source.sourceType) {
      const typeBadge = document.createElement("span");
      typeBadge.textContent = `Tür: ${source.sourceType}`;
      typeBadge.style.fontSize = "12px";
      badges.appendChild(typeBadge);
    }

    if (Number(source.citedByCount) > 0) {
      const citationBadge = document.createElement("span");
      citationBadge.textContent =
        `Atıf: ${Number(source.citedByCount).toLocaleString("tr-TR")}`;
      citationBadge.style.fontSize = "12px";
      badges.appendChild(citationBadge);
    }

    if (source.openAccess) {
      const openAccessBadge = document.createElement("span");
      openAccessBadge.textContent = "Açık erişim";
      openAccessBadge.style.fontSize = "12px";
      openAccessBadge.style.fontWeight = "700";
      openAccessBadge.style.color = "#315d4c";
      badges.appendChild(openAccessBadge);
    }

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";
    actions.style.flexWrap = "wrap";

    if (source.url) {
      const open = document.createElement("a");
      open.href = source.url;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.className = "secondary-button";
      open.textContent = "Kaynağı aç";
      actions.appendChild(open);
    }

    const saveDirect = document.createElement("button");
    saveDirect.type = "button";
    saveDirect.className = "primary";
    saveDirect.textContent = "＋ Literatürüme ekle";
    saveDirect.addEventListener("click", () => saveSourceSuggestionDirectly(source));
    actions.appendChild(saveDirect);

    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "secondary-button";
    choose.textContent = "Bilgileri forma aktar";
    choose.addEventListener("click", () => selectManualSourceCandidate(source));
    actions.appendChild(choose);

    card.appendChild(badges);
    card.appendChild(actions);
    return card;
  };

  const primarySources = sources.slice(0, 5);
  primarySources.forEach(source => resultsBox.appendChild(renderSourceCard(source)));

  if (sources.length > 5) {
    const moreBox = document.createElement("div");
    moreBox.hidden = true;
    sources.slice(5).forEach(source => moreBox.appendChild(renderSourceCard(source)));

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "secondary-button";
    moreButton.style.marginTop = "12px";
    moreButton.textContent = `Diğer sonuçları göster (${sources.length - 5})`;
    moreButton.addEventListener("click", () => {
      moreBox.hidden = !moreBox.hidden;
      moreButton.textContent = moreBox.hidden
        ? `Diğer sonuçları göster (${sources.length - 5})`
        : "Diğer sonuçları gizle";
    });

    resultsBox.appendChild(moreButton);
    resultsBox.appendChild(moreBox);
  }
}

function isDuplicateLibrarySource(
  library,
  source
) {
  const title =
    cleanValue(
      source?.title
    );

  const doi =
    cleanValue(
      source?.doi
    )
      .toLowerCase();

  return (
    Array.isArray(library)
      ? library
      : []
  ).some(
    (item) => {
      const sameTitle =
        title &&
        normalizeSearchText(
          item?.title
        ) ===
          normalizeSearchText(
            title
          );

      const itemDoi =
        cleanValue(
          item?.meta?.doi ||
          item?.doi
        )
          .toLowerCase();

      const sameDoi =
        doi &&
        itemDoi &&
        itemDoi === doi;

      return (
        sameTitle ||
        sameDoi
      );
    }
  );
}

function saveSourceSuggestionDirectly(
  source
) {
  const status =
    document.getElementById(
      "manualSourceSearchStatus"
    );

  if (
    !source ||
    typeof source !== "object"
  ) {
    if (status) {
      status.hidden = false;
      status.textContent =
        "Kaynak bilgisi okunamadı.";
    }

    return;
  }

  const library =
    getLibrary();

  if (
    isDuplicateLibrarySource(
      library,
      source
    )
  ) {
    if (status) {
      status.hidden = false;
      status.textContent =
        "Bu kaynak Literatürüm'de zaten bulunuyor.";
    }

    return;
  }

  const title =
    cleanValue(
      source.title
    );

  const authors =
    cleanValue(
      source.authors
    );

  const year =
    cleanValue(
      source.year
    );

  const doi =
    cleanValue(
      source.doi
    );

  const keywords =
    Array.isArray(
      source.keywords
    )
      ? source.keywords
          .map(
            (item) =>
              cleanValue(item)
          )
          .filter(Boolean)
      : [];

  const record = {
    id:
      Date.now() +
      Math.floor(
        Math.random() *
        1000
      ),

    title:
      title ||
      (
        authors
          ? `${authors} (${year || "yıl bilinmiyor"})`
          : doi ||
            "Bibliyografik kaynak"
      ),

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
    limitations: [],
    recommendations: [],
    keywords,
    contribution: "",
    findingEvidence: [],
    conclusionEvidence: [],
    limitationEvidence: [],
    recommendationEvidence: [],

    fileName:
      "Akademik kaynak araması",

    savedAt:
      new Date()
        .toISOString(),

    suggestedSource: false,
    manualSource: true,
    metadataMatched: true,

    meta: {
      authors,
      year,
      source:
        cleanValue(
          source.source
        ),
      doi,
      url:
        cleanValue(
          source.url
        ),
      sourceType:
        cleanValue(
          source.sourceType ||
          source.type
        ),
      openAccess:
        Boolean(
          source.openAccess
        ),
      citedByCount:
        Number(
          source.citedByCount ||
          0
        ),
      provider: "OpenAlex",
      metadataVerified: true
    }
  };

  library.unshift(
    record
  );

  setLibrary(
    library
  );

  if (status) {
    status.hidden = false;
    status.textContent =
      "✓ Kaynak Literatürüm'e eklendi. Bibliyografik bilgiler otomatik kaydedildi.";
  }

  renderLiteratureAnalysis();

  if (
    typeof renderLiterature ===
    "function"
  ) {
    renderLiterature();
  }
}

function selectManualSourceCandidate(
  source
) {
  selectedManualSourceCandidate =
    source;

  const setInput = (
    id,
    value
  ) => {
    const element =
      document.getElementById(
        id
      );

    if (
      element &&
      cleanValue(value)
    ) {
      element.value =
        value;
    }
  };

  setInput(
    "manualSourceTitle",
    source.title
  );

  setInput(
    "manualSourceAuthors",
    source.authors
  );

  setInput(
    "manualSourceYear",
    source.year
  );

  setInput(
    "manualSourceDoi",
    source.doi
  );

  setInput(
    "manualSourceJournal",
    source.source
  );

  setInput(
    "manualSourceUrl",
    source.url
  );

  if (
    Array.isArray(
      source.keywords
    ) &&
    source.keywords.length
  ) {
    setInput(
      "manualSourceKeywords",
      source.keywords.join(
        ", "
      )
    );
  }

  const status =
    document.getElementById(
      "manualSourceSearchStatus"
    );

  if (status) {
    status.hidden =
      false;

    status.textContent =
      "✓ Kaynak seçildi. Bulunabilen bibliyografik bilgiler forma aktarıldı.";
  }
}

function getManualLines(
  value
) {
  return cleanValue(
    value
  )
    .split("\n")
    .map(
      (item) =>
        cleanValue(item)
    )
    .filter(Boolean);
}

function saveManualSource() {
  const title =
    cleanValue(
      document.getElementById(
        "manualSourceTitle"
      )?.value
    );

  const authors =
    cleanValue(
      document.getElementById(
        "manualSourceAuthors"
      )?.value
    );

  const year =
    cleanValue(
      document.getElementById(
        "manualSourceYear"
      )?.value
    );

  const doi =
    cleanValue(
      document.getElementById(
        "manualSourceDoi"
      )?.value
    );

  const status =
    document.getElementById(
      "manualSourceStatus"
    );

  if (
    !title &&
    !authors &&
    !year &&
    !doi
  ) {
    if (status) {
      status.hidden =
        false;

      status.textContent =
        "Kaydetmek için başlık, yazar, yıl veya DOI bilgilerinden en az birini yaz.";
    }

    return;
  }

  const library =
    getLibrary();

  const duplicate =
    isDuplicateLibrarySource(
      library,
      {
        title,
        doi
      }
    );

  if (duplicate) {
    if (status) {
      status.hidden =
        false;

      status.textContent =
        "Bu kaynak Literatürüm'de zaten bulunuyor.";
    }

    return;
  }

  const findings =
    getManualLines(
      document.getElementById(
        "manualSourceFindings"
      )?.value
    );

  const limitations =
    getManualLines(
      document.getElementById(
        "manualSourceLimitations"
      )?.value
    );

  const recommendations =
    getManualLines(
      document.getElementById(
        "manualSourceRecommendations"
      )?.value
    );

  const keywords =
    cleanValue(
      document.getElementById(
        "manualSourceKeywords"
      )?.value
    )
      .split(",")
      .map(
        (item) =>
          cleanValue(item)
      )
      .filter(Boolean);

  const record = {
    id:
      Date.now() +
      Math.floor(
        Math.random() *
        1000
      ),

    title:
      title ||
      (
        authors
          ? `${authors} (${year || "yıl bilinmiyor"})`
          : doi ||
            "Bibliyografik kaynak"
      ),

    purpose:
      cleanValue(
        document.getElementById(
          "manualSourcePurpose"
        )?.value
      ),

    researchProblem:
      "",

    method:
      cleanValue(
        document.getElementById(
          "manualSourceMethod"
        )?.value
      ),

    researchDesign:
      cleanValue(
        document.getElementById(
          "manualSourceDesign"
        )?.value
      ),

    population:
      "",

    sample:
      cleanValue(
        document.getElementById(
          "manualSourceSample"
        )?.value
      ),

    dataCollection:
      "",

    dataAnalysis:
      "",

    summary:
      "",

    findings,

    conclusions:
      [],

    recommendations,

    keywords,

    contribution:
      "",

    findingEvidence:
      findings.map(
        (text) => ({
          text,
          source:
            "Kullanıcı tarafından manuel girildi"
        })
      ),

    conclusionEvidence:
      [],

    limitationEvidence:
      limitations.map(
        (text) => ({
          text,
          source:
            "Kullanıcı tarafından manuel girildi"
        })
      ),

    recommendationEvidence:
      recommendations.map(
        (text) => ({
          text,
          source:
            "Kullanıcı tarafından manuel girildi"
        })
      ),

    fileName:
      "Akıllı manuel kaynak",

    savedAt:
      new Date()
        .toISOString(),

    suggestedSource:
      false,

    manualSource:
      true,

    metadataMatched:
      Boolean(
        selectedManualSourceCandidate
      ),

    meta: {
      authors,

      year,

      source:
        cleanValue(
          document.getElementById(
            "manualSourceJournal"
          )?.value
        ),

      doi,

      url:
        cleanValue(
          document.getElementById(
            "manualSourceUrl"
          )?.value
        ),

      openAccess:
        Boolean(
          selectedManualSourceCandidate
            ?.openAccess
        ),

      citedByCount:
        Number(
          selectedManualSourceCandidate
            ?.citedByCount ||
          0
        ),

      provider:
        selectedManualSourceCandidate
          ? "OpenAlex"
          : "Manuel kayıt"
    }
  };

  library.unshift(
    record
  );

  setLibrary(
    library
  );

  document
    .getElementById(
      "manualSourceModal"
    )
    ?.remove();

  renderLiteratureAnalysis();

  if (
    typeof renderLiterature ===
    "function"
  ) {
    renderLiterature();
  }
}

addManualSourceButton
  ?.addEventListener(
    "click",
    openManualSourceForm
  );

addManualSourceFromLibrary
  ?.addEventListener(
    "click",
    openManualSourceForm
  );
// =====================================================
// AKTİF ARAŞTIRMA × LİTERATÜR UYUM HARİTASI
// ÜCRETSİZ YEREL ANALİZ
// =====================================================

function getActiveResearchCoreTokens(project) {
  if (!project) return [];

  return [
    ...new Set(
      getLiteratureFitTokens(
        [
          project.topic,
          project.purpose,
          project.problem,
          project.mainQuestion,
          ...(Array.isArray(project.questions)
            ? project.questions
            : []),
          ...(Array.isArray(project.keywords)
            ? project.keywords
            : [])
        ]
          .filter(Boolean)
          .join(" ")
      )
    )
  ];
}

function getSourceResearchCoverageTokens(item) {
  return new Set(
    getLiteratureFitTokens(
      [
        item?.title,
        item?.purpose,
        item?.researchProblem,
        item?.summary,
        item?.method,
        item?.researchDesign,
        item?.sample,
        ...(Array.isArray(item?.keywords)
          ? item.keywords
          : []),
        ...(Array.isArray(item?.findings)
          ? item.findings.slice(0, 5)
          : [])
      ]
        .filter(Boolean)
        .join(" ")
    )
  );
}

function getResearchFitBadgeText(level) {
  if (level === "high") return "Güçlü eşleşme";
  if (level === "medium") return "İlişkili";
  if (level === "possible") return "Olası bağlantı";
  if (level === "project-missing") return "Araştırma yok";
  return "Uygunluk net değil";
}

function getResearchQuestionCoverage(project, library) {
  const questions = [
    project?.mainQuestion,
    ...(Array.isArray(project?.questions) ? project.questions : [])
  ].filter(Boolean);

  return questions.map((question) => {
    const questionTokens = getLiteratureFitTokens(question);
    const supporting = library.filter((item) => {
      const sourceTokens = getSourceResearchCoverageTokens(item);
      const matched = questionTokens.filter((token) => sourceTokens.has(token));
      return matched.length >= Math.max(1, Math.ceil(questionTokens.length * 0.2));
    });

    return { question, supporting };
  });
}

function renderActiveResearchAnalysis(library) {
  const container =
    document.getElementById(
      "activeResearchAnalysisList"
    );

  if (!container) return;

  container.innerHTML = "";

  const project =
    getResearchProject();

  if (!project?.topic) {
    const empty =
      document.createElement("div");

    empty.className =
      "comparison-item";

    empty.innerHTML = `
      <strong>Aktif araştırma bulunamadı.</strong>
      <p>Araştırma bölümünde konunu kaydettiğinde seçili kaynaklar bu araştırmayla otomatik karşılaştırılır.</p>
    `;

    container.appendChild(empty);
    return;
  }

  const fits =
    library.map((item) => ({
      item,
      fit: buildLiteratureResearchFit(item)
    }));

  const strongCount =
    fits.filter(({ fit }) =>
      fit.level === "high"
    ).length;

  const relatedCount =
    fits.filter(({ fit }) =>
      fit.level === "medium"
    ).length;

  const possibleCount =
    fits.filter(({ fit }) =>
      fit.level === "possible"
    ).length;

  const unclearCount =
    fits.filter(({ fit }) =>
      fit.level === "low"
    ).length;

  const projectTokens =
    getActiveResearchCoreTokens(project);

  const covered = new Set();

  library.forEach((item) => {
    const sourceTokens =
      getSourceResearchCoverageTokens(item);

    projectTokens.forEach((token) => {
      if (sourceTokens.has(token)) {
        covered.add(token);
      }
    });
  });

  const coveredTerms =
    projectTokens
      .filter((token) => covered.has(token))
      .slice(0, 12);

  const uncoveredTerms =
    projectTokens
      .filter((token) => !covered.has(token))
      .slice(0, 10);

  const summary =
    document.createElement("div");

  summary.className =
    "comparison-item";

  const title =
    document.createElement("strong");

  title.textContent =
    `Aktif araştırma: ${project.topic}`;

  const overview =
    document.createElement("p");

  overview.textContent =
    `${library.length} seçili kaynağın ${strongCount} tanesi güçlü, ${relatedCount} tanesi ilişkili, ${possibleCount} tanesi olası bağlantılı, ${unclearCount} tanesi ise uygunluğu henüz net olmayan kaynak olarak görünüyor.`;

  summary.appendChild(title);
  summary.appendChild(overview);

  if (coveredTerms.length) {
    const coverage =
      document.createElement("p");

    coverage.innerHTML =
      `<strong>Araştırma çerçevende kaynaklar tarafından temsil edilen kavramlar:</strong> ${coveredTerms.join(", ")}.`;

    summary.appendChild(coverage);
  }

  if (uncoveredTerms.length) {
    const missing =
      document.createElement("p");

    missing.innerHTML =
      `<strong>Daha az temsil edilen kavramlar:</strong> ${uncoveredTerms.join(", ")}.`;

    summary.appendChild(missing);

    const warning =
      document.createElement("small");

    warning.textContent =
      "Bu bölüm kesin literatür boşluğu iddiası değildir. Yalnızca seçili kaynakların kayıtlı alanlarında açık eşleşme bulunmayan araştırma kavramlarını gösterir.";

    warning.style.display = "block";
    warning.style.marginTop = "8px";
    warning.style.opacity = "0.72";

    summary.appendChild(warning);
  }

  const questionCoverage = getResearchQuestionCoverage(project, library);

  if (questionCoverage.length) {
    const qBlock = document.createElement("div");
    qBlock.className = "comparison-item";

    const qTitle = document.createElement("strong");
    qTitle.textContent = "Araştırma sorularım seçili kaynaklarda karşılık buluyor mu?";
    qBlock.appendChild(qTitle);

    questionCoverage.forEach(({ question, supporting }) => {
      const row = document.createElement("p");
      row.style.marginTop = "8px";
      row.textContent = supporting.length
        ? `✓ ${shorten(question, 150)} — ${supporting.length} kaynakta kavramsal karşılık var.`
        : `△ ${shorten(question, 150)} — seçili kaynakların kayıtlı alanlarında açık karşılık bulunamadı.`;
      qBlock.appendChild(row);
    });

    const qNote = document.createElement("small");
    qNote.textContent = "Bu kontrol kavramsal kapsama sinyalidir; kaynakların araştırma sorusunu gerçekten yanıtladığını kanıtlamaz.";
    qNote.style.display = "block";
    qNote.style.marginTop = "8px";
    qNote.style.opacity = "0.72";
    qBlock.appendChild(qNote);
    container.appendChild(qBlock);
  }

  container.appendChild(summary);

  fits.forEach(({ item, fit }) => {
    const row =
      document.createElement("div");

    row.className =
      "comparison-item";

    const sourceTitle =
      document.createElement("strong");

    sourceTitle.textContent =
      item.title ||
      item.fileName ||
      "Başlıksız çalışma";

    const badge =
      document.createElement("span");

    badge.className =
      fit.level === "high"
        ? "evidence-badge explicit"
        : "evidence-badge fact";

    badge.style.display = "inline-block";
    badge.style.margin = "8px 0 5px";
    badge.textContent =
      fit.fitScore == null
        ? getResearchFitBadgeText(fit.level)
        : `${getResearchFitBadgeText(fit.level)} · %${fit.fitScore} uyum`;

    const detail =
      document.createElement("p");

    detail.textContent =
      fit.matchedTerms?.length
        ? `Araştırmanla ortak kavramlar: ${fit.matchedTerms.slice(0, 8).join(", ")}.`
        : "Araştırma çerçevesiyle açık bir kavram eşleşmesi bulunamadı.";

    const use =
      document.createElement("small");

    use.textContent =
      fit.thesisUse;

    use.style.display = "block";
    use.style.marginTop = "6px";
    use.style.opacity = "0.78";

    row.appendChild(sourceTitle);
    row.appendChild(document.createElement("br"));
    row.appendChild(badge);
    row.appendChild(detail);
    row.appendChild(use);

    container.appendChild(row);
  });

  const evidence =
    document.createElement("small");

  evidence.textContent =
    "Dayanak: kayıtlı araştırma çerçevesi + seçili kaynakların mevcut analiz alanları/metadata. AI kredisi kullanılmadı.";

  evidence.style.display = "block";
  evidence.style.marginTop = "10px";
  evidence.style.opacity = "0.7";

  container.appendChild(evidence);
}

// =====================================================
// LİTERATÜR ANALİZİ
// =====================================================

function renderLiteratureAnalysis() {
  const library =
    getLibrary();

  const analyzedLibrary =
    getAnalyzedLiterature(
      library
    );

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
    analyzedLibrary.length < 2
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
    analyzedLibrary,
    content
  );

  const comparedLibrary =
    getComparedLibrary(
      analyzedLibrary
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

  renderActiveResearchAnalysis(
    comparedLibrary
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

  const scopeNote = document.createElement("div");
  scopeNote.className = "comparison-item";
  scopeNote.innerHTML = `<strong>⚠️ Boşluk değil, boşluk sinyali</strong><p>Buradaki sonuçlar yalnızca seçtiğin kaynaklara dayanır. Academic AI yeterli kanıt olmadan “literatürde kesin boşluk var” sonucuna ulaşmaz.</p>`;
  container.appendChild(scopeNote);

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
// ACADEMIC AI V12 — ÜRÜN TAMAMLAMA KATMANI
// Araştırma → Kaynak → Not → Tez → Atıf → Asistan
// Ek AI çağrısı oluşturmaz; mevcut API/yerel verileri kullanır.
// =====================================================

const V12_THESIS_PROGRESS_KEY = "academicAIThesisProgressV12";

function v12CardStyle(el) {
  if (!el) return;
  el.style.border = "1px solid #d9d8cf";
  el.style.borderRadius = "18px";
  el.style.padding = "18px 20px";
  el.style.margin = "16px 0";
  el.style.background = "#fff";
}

function v12GetProgress() {
  try { return JSON.parse(localStorage.getItem(V12_THESIS_PROGRESS_KEY) || "{}"); }
  catch { return {}; }
}

function v12SetProgress(value) {
  localStorage.setItem(V12_THESIS_PROGRESS_KEY, JSON.stringify(value || {}));
}

function v12ThesisProgressPercent() {
  const stages = ["Giriş", "Literatür", "Yöntem", "Veri & Analiz", "Sonuç"];
  const progress = v12GetProgress();
  const weights = { "Başlanmadı": 0, "Devam ediyor": 50, "Tamamlandı": 100 };
  return Math.round(stages.reduce((sum, stage) => sum + (weights[progress[stage]] || 0), 0) / stages.length);
}

function v12InitNotes() {
  const page = document.getElementById("notes");
  if (!page) return;
  const title = document.getElementById("noteTitle");
  const text = document.getElementById("noteText") || document.getElementById("noteInput");
  const section = document.getElementById("noteSection");
  const panel = title?.closest(".panel") || text?.closest(".panel");
  if (!panel || !text) return;

  let save = panel.querySelector("[data-v12-save-note]");
  const wrongButton = [...panel.querySelectorAll("button")].find(b => normalizeSearchText(b.textContent).includes("kendi kaynagimi ekle"));
  if (wrongButton) {
    wrongButton.removeAttribute("data-go");
    wrongButton.setAttribute("data-v12-save-note", "1");
    wrongButton.textContent = "✓ Notu Kaydet";
    save = wrongButton;
  }
  if (!save) {
    save = document.createElement("button");
    save.type = "button";
    save.className = "primary";
    save.setAttribute("data-v12-save-note", "1");
    save.textContent = "✓ Notu Kaydet";
    panel.appendChild(save);
  }
  if (save.dataset.v12Bound) return;
  save.dataset.v12Bound = "1";
  save.addEventListener("click", () => {
    const body = cleanValue(text.value);
    if (!body) return;
    const notes = getNotes();
    notes.unshift({
      id: Date.now(),
      title: cleanValue(title?.value) || "Başlıksız not",
      text: body,
      section: cleanValue(section?.value),
      sourceId: null,
      createdAt: new Date().toISOString()
    });
    setNotes(notes);
    if (title) title.value = "";
    text.value = "";
    if (section) section.value = "";
    v12RenderNotes();
    v12RefreshDashboard();
  });
  v12RenderNotes();
}

function v12RenderNotes() {
  const list = document.getElementById("notesList");
  if (!list) return;
  const notes = getNotes();
  list.innerHTML = "";
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state"><strong>Henüz not yok</strong><p>Notlarını tez bölümlerine bağlayarak burada düzenleyebilirsin.</p></div>';
    return;
  }
  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";
    const heading = document.createElement("strong");
    heading.textContent = cleanValue(note.title) || "Akademik not";
    const body = document.createElement("p"); body.textContent = note.text || "";
    const meta = document.createElement("small");
    meta.textContent = `${note.section ? "Tez bölümü: " + note.section + " · " : ""}${new Date(note.createdAt || Date.now()).toLocaleString("tr-TR")}`;
    const actions = document.createElement("div"); actions.style.marginTop = "10px";
    const edit = document.createElement("button"); edit.type="button"; edit.textContent="Düzenle";
    const del = document.createElement("button"); del.type="button"; del.textContent="Sil"; del.style.marginLeft="8px";
    edit.addEventListener("click", () => {
      const title = document.getElementById("noteTitle");
      const text = document.getElementById("noteText") || document.getElementById("noteInput");
      const section = document.getElementById("noteSection");
      if (title) title.value = note.title || "";
      if (text) text.value = note.text || "";
      if (section) section.value = note.section || "";
      const updated = getNotes().filter(x => x.id !== note.id); setNotes(updated); v12RenderNotes();
      title?.scrollIntoView({behavior:"smooth", block:"center"});
    });
    del.addEventListener("click", () => { setNotes(getNotes().filter(x => x.id !== note.id)); v12RenderNotes(); v12RefreshDashboard(); });
    actions.append(edit, del); card.append(heading, body, meta, actions); list.appendChild(card);
  });
}

function v12InitThesisWorkspace() {
  const page = document.getElementById("thesis");
  const timeline = page?.querySelector(".timeline");
  if (!page || !timeline) return;
  let summary = page.querySelector("[data-v12-thesis-summary]");
  if (!summary) {
    summary = document.createElement("div"); summary.setAttribute("data-v12-thesis-summary","1"); v12CardStyle(summary);
    timeline.parentNode.insertBefore(summary, timeline);
  }
  const research = getResearchProject();
  summary.innerHTML = research?.topic
    ? `<small style="font-weight:700;letter-spacing:.08em">🎯 AKTİF ARAŞTIRMA</small><strong style="display:block;margin:7px 0">${escapeAssistantHTML(research.topic)}</strong><span>${getLibrary().length} kaynak · ${getNotes().length} not · Tez ilerlemesi %${v12ThesisProgressPercent()}</span>`
    : `<strong>Henüz aktif araştırma yok</strong><p>Araştırma bölümünde konunu kaydettiğinde tez çalışma alanı onunla bağlanır.</p>`;

  const progress = v12GetProgress();
  [...timeline.children].forEach(card => {
    const stage = cleanValue(card.querySelector("strong")?.textContent); if (!stage) return;
    const small = card.querySelector("small");
    const state = progress[stage] || "Başlanmadı"; if (small) small.textContent = state;
    card.style.cursor = "pointer"; card.title = "Tıkla: Başlanmadı → Devam ediyor → Tamamlandı";
    if (!card.dataset.v12Bound) {
      card.dataset.v12Bound="1";
      card.addEventListener("click", () => {
        const current = v12GetProgress(); const now = current[stage] || "Başlanmadı";
        current[stage] = now === "Başlanmadı" ? "Devam ediyor" : now === "Devam ediyor" ? "Tamamlandı" : "Başlanmadı";
        v12SetProgress(current); v12InitThesisWorkspace(); v12RefreshDashboard();
      });
    }
  });
}

function v12AuthorSurname(author) {
  const raw = Array.isArray(author) ? author[0] : String(author || "").split(/,|;/)[0];
  const parts = cleanValue(raw).split(/\s+/); return parts[parts.length - 1] || "Yazar";
}
function v12CitationForms(source) {
  const authorRaw = source.authors || source.author || "";
  const surname = v12AuthorSurname(authorRaw);
  const year = source.year || source.publicationYear || "t.y.";
  const title = source.title || "Başlık doğrulanamadı";
  const journal = source.source || source.journal || source.venue || "";
  const doiRaw = cleanValue(source.doi).replace(/^https?:\/\/doi\.org\//i, "").replace(/^doi:\s*/i, "");
  const authorText = Array.isArray(authorRaw) ? authorRaw.join(", ") : cleanValue(authorRaw) || "Yazar bilgisi doğrulanamadı";
  return {
    bibliography: `${authorText} (${year}). ${title}.${journal ? " " + journal + "." : ""}${doiRaw ? " https://doi.org/" + doiRaw : ""}`,
    parenthetical: `(${surname}, ${year})`, narrative: `${surname} (${year})`, direct: `(${surname}, ${year}, s. 00)`
  };
}

function v12RenderCitationSource(source, host, verified = false) {
  const forms = v12CitationForms(source); host.innerHTML = "";
  const card = document.createElement("div"); v12CardStyle(card);
  card.innerHTML = `<small style="font-weight:700">${verified ? "✓ METADATA KAYDI BULUNDU" : "LİTERATÜRÜMDEKİ KAYNAK"}</small><strong style="display:block;margin:7px 0">${escapeAssistantHTML(source.title || "Kaynak")}</strong><small>Bu doğrulama bibliyografik metadata içindir; akademik kalite değerlendirmesi değildir.</small>`;
  Object.entries({"Kaynakça":forms.bibliography,"Parantez içi":forms.parenthetical,"Anlatısal":forms.narrative,"Doğrudan alıntı":forms.direct}).forEach(([label,value]) => {
    const row=document.createElement("div"); row.style.marginTop="12px";
    const strong=document.createElement("strong"); strong.textContent=label;
    const p=document.createElement("p"); p.textContent=value; p.style.margin="4px 0";
    const copy=document.createElement("button"); copy.type="button"; copy.textContent="Kopyala"; copy.addEventListener("click",()=>navigator.clipboard?.writeText(value));
    row.append(strong,p,copy); card.appendChild(row);
  }); host.appendChild(card);
}

function v12InitCitations() {
  const page=document.getElementById("citations"); if(!page) return;
  const grid=page.querySelector(".citation-grid"); const panel=grid?.querySelector(".panel"); const preview=grid?.querySelector(".preview"); if(!panel||!preview) return;
  const input=panel.querySelector("input"); const button=panel.querySelector("button"); const hint=panel.querySelector(".hint");
  if(hint) hint.textContent="DOI veya başlıkla ücretsiz metadata araması. Metadata eşleşmesi akademik kalite onayı değildir.";
  let picker=panel.querySelector("[data-v12-library-picker]");
  if(!picker){ picker=document.createElement("select"); picker.setAttribute("data-v12-library-picker","1"); picker.style.width="100%"; picker.style.marginTop="12px"; panel.appendChild(picker); }
  const lib=getLibrary(); picker.innerHTML='<option value="">— Literatürümden kaynak seç —</option>'+lib.map((x,i)=>`<option value="${i}">${escapeAssistantHTML(x.title||x.fileName||"Kaynak")}</option>`).join("");
  picker.onchange=()=>{ if(picker.value!=="") v12RenderCitationSource(lib[Number(picker.value)],preview,false); };
  if(button && !button.dataset.v12Bound){ button.dataset.v12Bound="1"; button.addEventListener("click",async()=>{
    const q=cleanValue(input?.value); if(!q) return; button.disabled=true; button.textContent="Aranıyor…";
    try { const isDoi=/^10\.\d{4,9}\//i.test(q); const body=isDoi?{doi:q}:{title:q};
      const res=await fetch("/api/source-suggestions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); const data=await res.json();
      if(!res.ok||!data.success||!(data.sources||[]).length) throw new Error(data.message||"Kaynak bulunamadı.");
      v12RenderCitationSource(data.sources[0],preview,true);
    } catch(e){ preview.innerHTML=`<p><strong>Kaynak doğrulanamadı.</strong><br>${escapeAssistantHTML(cleanPublicErrorMessage(e.message))}</p>`; }
    finally { button.disabled=false; button.textContent="⌕ Kaynağı bul"; }
  }); }
}

function v12InitAssistant() {
  const page=document.getElementById("assistant"); if(!page) return;
  const input=document.getElementById("assistantInput"); if(!input) return;
  const box=input.closest(".assistant-chat") || input.parentElement?.parentElement; if(!box) return;
  let info=box.querySelector("[data-v12-assistant-modes]");
  if(!info){ info=document.createElement("div"); info.setAttribute("data-v12-assistant-modes","1"); v12CardStyle(info); info.innerHTML='<strong>Kaynak tabanlı çalışma modları</strong><p style="margin:6px 0 0">Tek belgeyi sorgula · Seçili literatürü birlikte sorgula · Kayıtlı araştırmanla karşılaştır.</p>'; box.insertBefore(info,input.parentElement); }
  let quick=box.querySelector("[data-v12-quick-prompts]");
  if(!quick){ quick=document.createElement("div"); quick.setAttribute("data-v12-quick-prompts","1"); quick.style.margin="10px 0"; ["Araştırma problemi nedir?","Sonuçları özetle","Eleştirel değerlendir","Kayıtlı araştırmamla karşılaştır"].forEach(label=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.style.margin="4px";b.addEventListener("click",()=>{input.value=label;input.focus();});quick.appendChild(b);}); box.insertBefore(quick,input.parentElement); }
}

function v12InitPapers() {
  const page=document.getElementById("papers"); if(!page) return;
  const texts=[...page.querySelectorAll("p,small,div")].filter(el=>cleanValue(el.textContent)==="Dosyanı seçmek için tıkla");
  if(texts.length>1) texts.slice(1).forEach(el=>{ if(!el.children.length) el.style.display="none"; });
}

function v12RefreshDashboard() {
  const research=getResearchProject(); const library=getLibrary(); const notes=getNotes();
  const lc=document.getElementById("literatureCount"); const pc=document.getElementById("paperCount"); const nc=document.getElementById("noteCount");
  if(lc) lc.textContent=library.length; if(pc) pc.textContent=library.length; if(nc) nc.textContent=notes.length;
  const home=document.getElementById("home"); if(!home) return;
  const progressCandidates=[...home.querySelectorAll("strong,b")].filter(el=>/%/.test(el.textContent||"")); if(progressCandidates[0]) progressCandidates[0].textContent=`${v12ThesisProgressPercent()}%`;
  const start=[...home.querySelectorAll("button,a")].find(el=>normalizeSearchText(el.textContent).includes("arastirmaya basla"));
  if(start && research?.topic) { start.textContent="→ Araştırmama devam et"; start.onclick=(e)=>{e.preventDefault();go("research");}; }
}

function v12InitAll() {
  v12InitPapers(); v12InitNotes(); v12InitThesisWorkspace(); v12InitCitations(); v12InitAssistant(); v12RefreshDashboard();
}

setTimeout(v12InitAll, 0);
document.addEventListener("click", event => {
  const nav=event.target.closest?.("[data-go], .nav-item"); if(nav) setTimeout(v12InitAll, 0);
});

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
// =====================================================
// ACADEMIC AI — V13 TOPLU DÜZELTME
// APA + NOT KAYNAK BAĞI + TEZ ÇALIŞMA ALANI + PROFESYONEL ASİSTAN
// =====================================================

function v13GetSourceMeta(source = {}) {
  const meta = source.meta || {};
  return {
    title: cleanValue(source.title || meta.title || source.fileName),
    authors: cleanValue(source.authors || source.author || meta.authors || meta.author),
    year: cleanValue(source.year || source.publicationYear || meta.year || meta.publicationYear),
    journal: cleanValue(source.source || source.journal || source.venue || meta.source || meta.journal || meta.venue),
    doi: cleanValue(source.doi || meta.doi),
    url: cleanValue(source.url || meta.url)
  };
}

function v13AuthorSurname(author) {
  const raw = Array.isArray(author)
    ? cleanValue(author[0])
    : cleanValue(String(author || "").split(/;|\band\b|\s+ve\s+/i)[0]);
  if (!raw) return "Yazar";
  const commaParts = raw.split(",").map(x => x.trim()).filter(Boolean);
  if (commaParts.length > 1) return commaParts[0];
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || "Yazar";
}

function v13CitationForms(source, pageNumber = "") {
  const meta = v13GetSourceMeta(source);
  const surname = v13AuthorSurname(meta.authors);
  const year = meta.year || "t.y.";
  const authorText = meta.authors || "Yazar bilgisi doğrulanamadı";
  const title = meta.title || "Başlık doğrulanamadı";
  const doiRaw = meta.doi
    .replace(/^https?:\/\/doi\.org\//i, "")
    .replace(/^doi:\s*/i, "");
  const page = cleanValue(pageNumber).replace(/^s\.?\s*/i, "");
  return {
    bibliography: `${authorText} (${year}). ${title}.${meta.journal ? " " + meta.journal + "." : ""}${doiRaw ? " https://doi.org/" + doiRaw : ""}`,
    parenthetical: `(${surname}, ${year})`,
    narrative: `${surname} (${year})`,
    direct: page
      ? `(${surname}, ${year}, s. ${page})`
      : `(${surname}, ${year}, s. …)`
  };
}

function v13CitationCopyRow(card, label, value) {
  const row = document.createElement("div");
  row.style.cssText = "margin-top:16px;padding-top:14px;border-top:1px solid rgba(20,55,45,.12)";
  const strong = document.createElement("strong");
  strong.textContent = label;
  strong.style.display = "block";
  const p = document.createElement("p");
  p.textContent = value;
  p.style.cssText = "margin:6px 0 9px;line-height:1.55";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Kopyala";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard?.writeText(value);
      const old = copy.textContent;
      copy.textContent = "✓ Kopyalandı";
      setTimeout(() => copy.textContent = old, 1200);
    } catch {}
  });
  row.append(strong, p, copy);
  card.appendChild(row);
}

function v13RenderCitationSource(source, host, verified = false) {
  if (!host) return;
  host.innerHTML = "";
  const meta = v13GetSourceMeta(source);
  const card = document.createElement("div");
  v12CardStyle(card);

  const badge = document.createElement("small");
  badge.style.cssText = "font-weight:800;letter-spacing:.06em";
  badge.textContent = verified
    ? "✓ BİBLİYOGRAFİK METADATA EŞLEŞMESİ"
    : "LİTERATÜRÜMDEKİ KAYNAK";

  const title = document.createElement("strong");
  title.textContent = meta.title || "Kaynak";
  title.style.cssText = "display:block;margin:8px 0;font-size:1.05em";

  const info = document.createElement("p");
  info.style.cssText = "margin:0 0 12px;opacity:.78";
  info.textContent = "Bu kontrol bibliyografik metadata içindir; kaynağın akademik kalite değerlendirmesi değildir.";

  const metadata = document.createElement("div");
  metadata.style.cssText = "display:grid;gap:5px;margin:12px 0";
  const fields = [
    ["Yazar", meta.authors || "Doğrulanamadı"],
    ["Yıl", meta.year || "Doğrulanamadı"],
    ["Kaynak / Dergi", meta.journal || "Doğrulanamadı"],
    ["DOI", meta.doi || "Doğrulanamadı"]
  ];
  fields.forEach(([k, v]) => {
    const line = document.createElement("small");
    line.textContent = `${k}: ${v}`;
    metadata.appendChild(line);
  });

  const pageWrap = document.createElement("label");
  pageWrap.style.cssText = "display:block;margin-top:14px;font-weight:700";
  pageWrap.textContent = "Doğrudan alıntı için sayfa numarası";
  const pageInput = document.createElement("input");
  pageInput.type = "text";
  pageInput.inputMode = "numeric";
  pageInput.placeholder = "Örn. 47";
  pageInput.style.cssText = "display:block;width:180px;max-width:100%;margin-top:7px";
  pageWrap.appendChild(pageInput);

  const outputs = document.createElement("div");
  function rerenderForms() {
    outputs.innerHTML = "";
    const forms = v13CitationForms(source, pageInput.value);
    v13CitationCopyRow(outputs, "Kaynakça", forms.bibliography);
    v13CitationCopyRow(outputs, "Parantez içi", forms.parenthetical);
    v13CitationCopyRow(outputs, "Anlatısal", forms.narrative);
    v13CitationCopyRow(outputs, "Doğrudan alıntı", forms.direct);
  }
  pageInput.addEventListener("input", rerenderForms);

  card.append(badge, title, info, metadata, pageWrap, outputs);
  host.appendChild(card);
  rerenderForms();
}

async function v13TryEnrichCitation(source) {
  const current = v13GetSourceMeta(source);
  if ((current.authors && current.year) || !current.title) return { source, verified: false };
  try {
    const res = await fetch("/api/source-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: current.title })
    });
    const data = await res.json();
    const found = data?.success && Array.isArray(data.sources) ? data.sources[0] : null;
    if (!res.ok || !found) return { source, verified: false };
    const fm = v13GetSourceMeta(found);
    return {
      verified: true,
      source: {
        ...source,
        authors: current.authors || fm.authors,
        year: current.year || fm.year,
        source: current.journal || fm.journal,
        doi: current.doi || fm.doi,
        url: current.url || fm.url
      }
    };
  } catch {
    return { source, verified: false };
  }
}

function v12InitCitations() {
  const page = document.getElementById("citations");
  if (!page) return;
  const grid = page.querySelector(".citation-grid");
  const panel = grid?.querySelector(".panel");
  const preview = grid?.querySelector(".preview");
  if (!panel || !preview) return;
  const input = panel.querySelector("input");
  const button = panel.querySelector("button");
  const hint = panel.querySelector(".hint");
  if (hint) hint.textContent = "DOI veya başlıkla ücretsiz metadata araması. Metadata eşleşmesi akademik kalite onayı değildir.";

  let picker = panel.querySelector("[data-v12-library-picker]");
  if (!picker) {
    picker = document.createElement("select");
    picker.setAttribute("data-v12-library-picker", "1");
    picker.style.cssText = "width:100%;margin-top:12px";
    panel.appendChild(picker);
  }
  const lib = getLibrary();
  picker.innerHTML = '<option value="">— Literatürümden kaynak seç —</option>' +
    lib.map((x, i) => `<option value="${i}">${escapeAssistantHTML(x.title || x.fileName || "Kaynak")}</option>`).join("");
  picker.onchange = async () => {
    if (picker.value === "") return;
    const source = lib[Number(picker.value)];
    v13RenderCitationSource(source, preview, false);
    const meta = v13GetSourceMeta(source);
    if (!meta.authors || !meta.year) {
      const enriched = await v13TryEnrichCitation(source);
      if (enriched.verified) v13RenderCitationSource(enriched.source, preview, true);
    }
  };

  if (button && !button.dataset.v13Bound) {
    button.dataset.v13Bound = "1";
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const q = cleanValue(input?.value);
      if (!q) return;
      button.disabled = true;
      button.textContent = "Aranıyor…";
      try {
        const isDoi = /^10\.\d{4,9}\//i.test(q);
        const res = await fetch("/api/source-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isDoi ? { doi: q } : { title: q })
        });
        const data = await res.json();
        const found = data?.success && Array.isArray(data.sources) ? data.sources[0] : null;
        if (!res.ok || !found) throw new Error(data?.message || "Kaynak bulunamadı.");
        v13RenderCitationSource(found, preview, true);
      } catch (e) {
        preview.innerHTML = "";
        const warn = document.createElement("div");
        v12CardStyle(warn);
        warn.innerHTML = `<strong>Kaynak doğrulanamadı.</strong><p>${escapeAssistantHTML(cleanPublicErrorMessage(e.message))}</p>`;
        preview.appendChild(warn);
      } finally {
        button.disabled = false;
        button.textContent = "⌕ Kaynağı bul";
      }
    }, true);
  }
}

// =====================================================
// V13 — NOTLARI KAYNAĞA BAĞLA
// =====================================================

function v13EnsureNoteSourcePicker(panel) {
  if (!panel) return null;
  let picker = panel.querySelector("[data-v13-note-source]");
  if (!picker) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin-top:12px";
    const label = document.createElement("label");
    label.textContent = "Kaynak bağlantısı (isteğe bağlı)";
    label.style.cssText = "display:block;font-weight:700;margin-bottom:6px";
    picker = document.createElement("select");
    picker.setAttribute("data-v13-note-source", "1");
    picker.style.width = "100%";
    wrap.append(label, picker);
    panel.appendChild(wrap);
  }
  const library = getLibrary();
  picker.innerHTML = '<option value="">— Kaynak bağlama —</option>' + library.map(item => {
    const id = getItemId(item);
    return `<option value="${escapeAssistantHTML(id)}">${escapeAssistantHTML(item.title || item.fileName || "Kaynak")}</option>`;
  }).join("");
  return picker;
}

function v12RenderNotes() {
  const list = document.getElementById("notesList");
  if (!list) return;
  const notes = getNotes();
  const library = getLibrary();
  list.innerHTML = "";
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state"><strong>Henüz not yok</strong><p>Notlarını tez bölümlerine ve akademik kaynaklara bağlayarak burada düzenleyebilirsin.</p></div>';
    return;
  }
  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";
    const heading = document.createElement("strong");
    heading.textContent = cleanValue(note.title) || "Akademik not";
    const body = document.createElement("p");
    body.textContent = note.text || "";
    const source = note.sourceId
      ? library.find(x => String(getItemId(x)) === String(note.sourceId))
      : null;
    const meta = document.createElement("small");
    const metaParts = [];
    if (note.section) metaParts.push(`Tez bölümü: ${note.section}`);
    if (source) metaParts.push(`Kaynak: ${source.title || source.fileName || "Akademik kaynak"}`);
    metaParts.push(new Date(note.createdAt || Date.now()).toLocaleString("tr-TR"));
    meta.textContent = metaParts.join(" · ");
    const actions = document.createElement("div");
    actions.style.marginTop = "10px";
    const edit = document.createElement("button");
    edit.type = "button"; edit.textContent = "Düzenle";
    const del = document.createElement("button");
    del.type = "button"; del.textContent = "Sil"; del.style.marginLeft = "8px";
    edit.addEventListener("click", () => {
      const title = document.getElementById("noteTitle");
      const text = document.getElementById("noteText") || document.getElementById("noteInput");
      const section = document.getElementById("noteSection");
      const panel = title?.closest(".panel") || text?.closest(".panel");
      const picker = v13EnsureNoteSourcePicker(panel);
      if (title) title.value = note.title || "";
      if (text) text.value = note.text || "";
      if (section) section.value = note.section || "";
      if (picker) picker.value = note.sourceId ? String(note.sourceId) : "";
      const updated = getNotes().filter(x => x.id !== note.id);
      setNotes(updated);
      v12RenderNotes();
      title?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    del.addEventListener("click", () => {
      setNotes(getNotes().filter(x => x.id !== note.id));
      v12RenderNotes();
      v12RefreshDashboard();
    });
    actions.append(edit, del);
    card.append(heading, body, meta, actions);
    list.appendChild(card);
  });
}

function v12InitNotes() {
  const page = document.getElementById("notes");
  if (!page) return;
  const title = document.getElementById("noteTitle");
  const text = document.getElementById("noteText") || document.getElementById("noteInput");
  const section = document.getElementById("noteSection");
  const panel = title?.closest(".panel") || text?.closest(".panel");
  if (!panel || !text) return;

  let save = panel.querySelector("[data-v12-save-note]");
  const wrongButton = [...panel.querySelectorAll("button")].find(b => normalizeSearchText(b.textContent).includes("kendi kaynagimi ekle"));
  if (wrongButton) {
    wrongButton.removeAttribute("data-go");
    wrongButton.setAttribute("data-v12-save-note", "1");
    wrongButton.textContent = "✓ Notu Kaydet";
    save = wrongButton;
  }
  if (!save) {
    save = document.createElement("button");
    save.type = "button";
    save.className = "primary";
    save.setAttribute("data-v12-save-note", "1");
    save.textContent = "✓ Notu Kaydet";
    panel.appendChild(save);
  }
  const picker = v13EnsureNoteSourcePicker(panel);

  if (!save.dataset.v13Bound) {
    save.dataset.v13Bound = "1";
    save.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const body = cleanValue(text.value);
      if (!body) return;
      const notes = getNotes();
      notes.unshift({
        id: Date.now(),
        title: cleanValue(title?.value) || "Başlıksız not",
        text: body,
        section: cleanValue(section?.value),
        sourceId: cleanValue(picker?.value) || null,
        createdAt: new Date().toISOString()
      });
      setNotes(notes);
      if (title) title.value = "";
      text.value = "";
      if (section) section.value = "";
      if (picker) picker.value = "";
      v12RenderNotes();
      v12RefreshDashboard();
    }, true);
  }
  v12RenderNotes();
}

// =====================================================
// V13 — TEZ BÖLÜMLERİ GERÇEK ÇALIŞMA ALANI
// =====================================================

function v13GetThesisSections() {
  try {
    return JSON.parse(localStorage.getItem("academicAIThesisSectionsV13") || "{}") || {};
  } catch { return {}; }
}
function v13SetThesisSections(value) {
  localStorage.setItem("academicAIThesisSectionsV13", JSON.stringify(value || {}));
}

function v14ThesisFieldConfig(stage) {
  const configs = {
    "Giriş": [
      ["problem", "Araştırma problemi", "Araştırmanın çözmeye çalıştığı temel problemi açık ve sınırları belli biçimde yaz."],
      ["importance", "Araştırmanın önemi ve gerekçesi", "Bu çalışma neden gerekli? Bilimsel, toplumsal veya mesleki önemini not et."],
      ["purpose", "Araştırmanın amacı", "Genel amacı ve gerekiyorsa alt amaçları netleştir."],
      ["questions", "Araştırma soruları / hipotezler", "Ana araştırma sorusunu ve alt soruları burada geliştir."],
      ["scope", "Kapsam ve sınırlar", "Çalışmanın konu, zaman, coğrafya, kurum veya örneklem sınırlarını yaz."],
      ["concepts", "Temel kavramlar", "Girişte tanımlanması gereken temel kavramları ve kısa açıklamalarını not et."]
    ],
    "Literatür": [
      ["themes", "Ana temalar", "Literatürü hangi ana temalar altında örgütleyeceğini yaz."],
      ["theory", "Kuramsal / kavramsal çerçeve", "Kullanılacak kuramları, modelleri veya kavramsal yaklaşımı belirt."],
      ["keyStudies", "Temel çalışmalar", "Mutlaka tartışılması gereken öncü veya doğrudan ilgili çalışmaları not et."],
      ["commonFindings", "Ortak bulgular", "Kaynaklarda tekrar eden sonuçları ve ortak eğilimleri özetle."],
      ["differences", "Çelişkiler ve farklılaşan bulgular", "Çalışmaların hangi noktalarda ayrıştığını yaz."],
      ["gapSignals", "Araştırma boşluğu sinyalleri", "Kesin boşluk ilan etmeden, az çalışılmış veya belirsiz kalan alanları kaydet."],
      ["synthesis", "Literatür sentezi", "Kaynakları tek tek sıralamak yerine birbirleriyle ilişkilendiren sentez taslağını oluştur."]
    ],
    "Yöntem": [
      ["approach", "Araştırma yaklaşımı", "Nitel, nicel veya karma yaklaşım ve seçilme gerekçesi."],
      ["design", "Araştırma deseni", "Durum çalışması, fenomenoloji, tarama, deneysel desen vb. ve gerekçesi."],
      ["populationSample", "Evren / örneklem / çalışma grubu", "Evreni, örneklem büyüklüğünü, katılımcı özelliklerini ve seçme yöntemini yaz."],
      ["dataCollection", "Veri toplama süreci", "Görüşme, anket, gözlem, doküman vb. araçları ve uygulama sürecini açıkla."],
      ["dataAnalysis", "Veri analizi", "Tematik analiz, içerik analizi, istatistiksel testler, yazılım vb. ayrıntıları yaz."],
      ["validity", "Geçerlik / güvenirlik / inandırıcılık", "Araştırmanın niteliğine uygun kalite ve güvenilirlik önlemlerini planla."],
      ["ethics", "Etik süreç", "Etik kurul, gönüllü onam, gizlilik, veri koruma ve diğer etik adımları not et."],
      ["limitations", "Yöntemsel sınırlılıklar", "Yöntemden kaynaklanan olası sınırlılıkları ve nasıl yönetileceğini yaz."]
    ],
    "Veri & Analiz": [
      ["dataStatus", "Veri durumu", "Toplanan veri, eksik veri ve veri temizleme durumunu kaydet."],
      ["coding", "Kodlama / değişkenler", "Kodlar, kategoriler, temalar veya kullanılacak değişkenleri planla."],
      ["analysisPlan", "Analiz planı", "Hangi araştırma sorusuna hangi analizle cevap verileceğini yaz."],
      ["findingsStructure", "Bulguların yapısı", "Bulguları hangi başlık ve alt başlıklarda sunacağını planla."],
      ["tablesFigures", "Tablo / şekil / görsel planı", "Kullanılması gereken tablo, şekil veya görselleri not et."],
      ["evidenceChecks", "Kanıt ve tutarlılık kontrolleri", "Bulguların veriyle desteklenmesi, karşı örnekler ve tutarlılık kontrollerini planla."],
      ["interpretationNotes", "Yorumlama notları", "Bulguyla yorumu birbirinden ayırarak tartışmada kullanılacak ilk notları tut."]
    ],
    "Sonuç": [
      ["answerQuestions", "Araştırma sorularının yanıtları", "Her araştırma sorusunun bulgulara dayalı kısa yanıtını planla."],
      ["discussion", "Tartışma bağlantıları", "Bulguların önceki literatürle nerede örtüştüğünü veya ayrıştığını yaz."],
      ["contribution", "Akademik / uygulamalı katkı", "Çalışmanın literatüre, yönteme veya uygulamaya katkısını açıkla."],
      ["limitations", "Araştırmanın sınırlılıkları", "Çalışmanın gerçek sınırlılıklarını kanıta dayalı ve ölçülü biçimde yaz."],
      ["recommendations", "Öneriler", "Uygulayıcılara, kurumlara veya araştırmacılara yönelik önerileri ayır."],
      ["futureResearch", "Gelecek araştırmalar", "Bu çalışmadan hareketle hangi yeni araştırmaların yapılabileceğini yaz."],
      ["finalMessage", "Sonuç mesajı", "Tezin sonunda okuyucunun hatırlaması gereken temel akademik sonucu netleştir."]
    ]
  };
  return configs[stage] || configs["Giriş"];
}

function v14CreateThesisField(key, labelText, placeholder, value) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "padding:14px;border:1px solid rgba(20,55,45,.12);border-radius:14px;background:rgba(255,255,255,.55)";
  const label = document.createElement("label");
  label.textContent = labelText;
  label.style.cssText = "display:block;font-weight:800;margin-bottom:7px";
  const area = document.createElement("textarea");
  area.dataset.v14ThesisField = key;
  area.value = value || "";
  area.placeholder = placeholder;
  area.style.cssText = "width:100%;min-height:105px;resize:vertical;box-sizing:border-box";
  wrap.append(label, area);
  return wrap;
}

function v14ThesisEvidenceSummary(stage, library, notes) {
  const rich = library.filter(item => cleanValue(item?.method) || (Array.isArray(item?.findings) && item.findings.length));
  const methodCount = library.filter(item => cleanValue(item?.method)).length;
  const findingCount = library.filter(item => Array.isArray(item?.findings) && item.findings.length).length;
  const messages = {
    "Giriş": `${library.length} kayıtlı kaynak ve ${notes.length} bağlı not var. Girişte problem, önem ve amaç için özellikle doğrudan konu eşleşmesi yüksek kaynakları kullan.`,
    "Literatür": `${library.length} kaynak içinde ${rich.length} kaynakta analiz alanı bulunuyor; ${findingCount} kaynakta bulgu bilgisi var. Sentezi yalnızca metadata değil, içerik analizi yapılmış kaynaklara dayandır.`,
    "Yöntem": `${methodCount} kaynakta yöntem bilgisi kayıtlı. Kendi yöntemini gerekçelendirirken benzer çalışmaların desen, örneklem, veri toplama ve analiz tercihlerini karşılaştırabilirsin.`,
    "Veri & Analiz": `${findingCount} kaynakta bulgu bilgisi bulunuyor. Bulgularını önce kendi verinden üret; literatürü yorumlama ve karşılaştırma aşamasında kullan.`,
    "Sonuç": `${findingCount} kaynakta karşılaştırılabilir bulgu kaydı var. Sonuç bölümünde yeni bulgu üretme; araştırma sorularına verdiğin yanıtları, katkıyı ve gerçek sınırlılıkları toparla.`
  };
  return messages[stage] || messages["Giriş"];
}

function v14OpenThesisSourcePicker(library, selectedIds, onToggle) {
  const box = document.createElement("div");
  box.style.cssText = "display:grid;gap:10px";
  if (!library.length) {
    const p = document.createElement("p");
    p.textContent = "Henüz Literatürümde kaynak yok.";
    box.appendChild(p);
    return box;
  }
  library.forEach(item => {
    const id = String(getItemId(item));
    const row = document.createElement("label");
    row.style.cssText = "display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:12px;border:1px solid rgba(20,55,45,.12);border-radius:12px;background:rgba(255,255,255,.5);cursor:pointer";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = selectedIds.has(id);
    check.addEventListener("change", () => onToggle(id, check.checked));
    const body = document.createElement("span");
    const title = document.createElement("strong");
    title.style.display = "block";
    title.textContent = item.title || item.fileName || "Akademik kaynak";
    const meta = document.createElement("small");
    const year = cleanValue(item.year || item?.meta?.year);
    const method = cleanValue(item.method);
    let fit = null;
    try { fit = buildLiteratureResearchFit(item); } catch {}
    meta.textContent = [year, method, fit?.title].filter(Boolean).join(" · ") || "Bibliyografik kayıt";
    meta.style.cssText = "display:block;margin-top:4px;opacity:.72";
    body.append(title, meta);
    row.append(check, body);
    box.appendChild(row);
  });
  return box;
}

function v14MakeTabButton(label, key, activeKey, activate) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.v14Tab = key;
  button.style.cssText = activeKey === key
    ? "padding:10px 14px;border-radius:999px;border:1px solid #163f35;background:#163f35;color:white;font-weight:800"
    : "padding:10px 14px;border-radius:999px;border:1px solid rgba(20,55,45,.18);background:transparent;font-weight:700";
  button.addEventListener("click", () => activate(key));
  return button;
}

function v13OpenThesisSection(stage) {
  const page = document.getElementById("thesis");
  const timeline = page?.querySelector(".timeline");
  if (!page || !timeline || !stage) return;

  let panel = page.querySelector("[data-v13-thesis-editor]");
  if (!panel) {
    panel = document.createElement("section");
    panel.setAttribute("data-v13-thesis-editor", "1");
    panel.style.cssText = "margin-top:24px";
    timeline.insertAdjacentElement("afterend", panel);
  }
  panel.innerHTML = "";
  v12CardStyle(panel);
  panel.style.padding = "22px";

  const all = v13GetThesisSections();
  const legacy = all[stage] || {};
  const current = {
    fields: legacy.fields || {},
    draft: legacy.draft || legacy.text || "",
    advisorNotes: legacy.advisorNotes || "",
    tasks: legacy.tasks || "",
    sourceIds: Array.isArray(legacy.sourceIds) ? legacy.sourceIds.map(String) : [],
    updatedAt: legacy.updatedAt || null
  };
  const progress = v12GetProgress();
  const library = getLibrary();
  const notes = getNotes().filter(n => cleanValue(n.section) === stage || (stage === "Veri & Analiz" && cleanValue(n.section) === "Bulgular"));
  const selectedIds = new Set(current.sourceIds);

  const hero = document.createElement("div");
  hero.style.cssText = "display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap;padding-bottom:18px;border-bottom:1px solid rgba(20,55,45,.12)";
  const heroText = document.createElement("div");
  const eyebrow = document.createElement("small");
  eyebrow.textContent = "TEZ / DOKTORA · BÖLÜM ÇALIŞMA ALANI V2";
  eyebrow.style.cssText = "font-weight:900;letter-spacing:.1em;opacity:.75";
  const heading = document.createElement("h2");
  heading.textContent = stage;
  heading.style.cssText = "margin:7px 0 6px;font-size:clamp(26px,4vw,40px)";
  const sub = document.createElement("p");
  sub.textContent = "Akademik planını, taslağını, kaynaklarını ve bölüm notlarını tek yerde yönet.";
  sub.style.cssText = "margin:0;opacity:.75";
  heroText.append(eyebrow, heading, sub);

  const stateWrap = document.createElement("div");
  stateWrap.style.cssText = "min-width:210px";
  const stateLabel = document.createElement("label");
  stateLabel.textContent = "Bölüm durumu";
  stateLabel.style.cssText = "display:block;font-size:12px;font-weight:800;letter-spacing:.06em;margin-bottom:6px";
  const stateSelect = document.createElement("select");
  ["Başlanmadı", "Devam ediyor", "Tamamlandı"].forEach(value => {
    const o = document.createElement("option"); o.value = value; o.textContent = value; stateSelect.appendChild(o);
  });
  stateSelect.value = progress[stage] || "Başlanmadı";
  stateSelect.style.cssText = "width:100%;padding:10px";
  stateWrap.append(stateLabel, stateSelect);
  hero.append(heroText, stateWrap);

  const stats = document.createElement("div");
  stats.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0";
  const completedFields = v14ThesisFieldConfig(stage).filter(([key]) => cleanValue(current.fields[key])).length;
  const statItems = [
    ["Akademik alan", `${completedFields}/${v14ThesisFieldConfig(stage).length} dolu`],
    ["Bağlı kaynak", `${current.sourceIds.length}`],
    ["Bağlı not", `${notes.length}`],
    ["Son güncelleme", current.updatedAt ? new Date(current.updatedAt).toLocaleDateString("tr-TR") : "Henüz yok"]
  ];
  statItems.forEach(([label, value]) => {
    const card = document.createElement("div");
    card.style.cssText = "padding:12px;border:1px solid rgba(20,55,45,.12);border-radius:12px;background:rgba(255,255,255,.5)";
    const s = document.createElement("small"); s.textContent = label; s.style.cssText = "display:block;opacity:.65;font-weight:700";
    const b = document.createElement("strong"); b.textContent = value; b.style.cssText = "display:block;margin-top:4px";
    card.append(s,b); stats.appendChild(card);
  });

  const evidence = document.createElement("div");
  evidence.style.cssText = "padding:14px 16px;border-radius:14px;background:rgba(27,92,74,.07);border:1px solid rgba(27,92,74,.13);margin-bottom:16px";
  const evTitle = document.createElement("strong");
  evTitle.textContent = "✦ Academic AI bu bölüm için ne biliyor?";
  const evText = document.createElement("p");
  evText.textContent = v14ThesisEvidenceSummary(stage, library, notes);
  evText.style.cssText = "margin:7px 0 0;line-height:1.55";
  const evNote = document.createElement("small");
  evNote.textContent = "Bu özet yalnızca kayıtlı kaynak/not verilerinden oluşturulur; AI kredisi kullanılmaz ve yeni akademik kanıt üretmez.";
  evNote.style.cssText = "display:block;margin-top:8px;opacity:.65";
  evidence.append(evTitle, evText, evNote);

  const tabs = document.createElement("div");
  tabs.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 14px";
  const content = document.createElement("div");
  let activeTab = "plan";
  let fieldAreas = {};
  let draftArea = null;
  let advisorArea = null;
  let tasksArea = null;

  function captureCurrentTab() {
    if (activeTab === "plan") {
      Object.entries(fieldAreas).forEach(([key, area]) => current.fields[key] = area.value);
    } else if (activeTab === "draft" && draftArea) current.draft = draftArea.value;
    else if (activeTab === "notes") {
      if (advisorArea) current.advisorNotes = advisorArea.value;
      if (tasksArea) current.tasks = tasksArea.value;
    }
  }

  function renderTabs() {
    tabs.innerHTML = "";
    [
      ["Akademik plan", "plan"],
      ["Taslak metin", "draft"],
      ["Kaynaklar", "sources"],
      ["Notlar & yapılacaklar", "notes"]
    ].forEach(([label,key]) => tabs.appendChild(v14MakeTabButton(label,key,activeTab,activateTab)));
  }

  function activateTab(key) {
    captureCurrentTab();
    activeTab = key;
    renderTabs();
    content.innerHTML = "";
    fieldAreas = {};

    if (key === "plan") {
      const intro = document.createElement("p");
      intro.textContent = `${stage} bölümü için akademik kontrol alanları. Bunlar tez metninin kendisi değil; bölümünü sistematik biçimde planlaman için çalışma çerçevesidir.`;
      intro.style.cssText = "margin:0 0 12px;opacity:.75";
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px";
      v14ThesisFieldConfig(stage).forEach(([fieldKey,label,placeholder]) => {
        const wrap = v14CreateThesisField(fieldKey,label,placeholder,current.fields[fieldKey]);
        fieldAreas[fieldKey] = wrap.querySelector("textarea");
        grid.appendChild(wrap);
      });
      content.append(intro, grid);
      return;
    }

    if (key === "draft") {
      const info = document.createElement("div");
      info.style.cssText = "padding:12px 14px;border-left:4px solid #8f7228;background:rgba(143,114,40,.07);margin-bottom:12px";
      info.textContent = "Taslak alanı: Kendi akademik metnini geliştir. Kaynaklardan aldığın bilgileri atıfsız bırakma ve belgesel bilgi ile kendi yorumunu ayır.";
      draftArea = document.createElement("textarea");
      draftArea.value = current.draft;
      draftArea.placeholder = `${stage} bölümünün çalışma taslağını burada geliştir...`;
      draftArea.style.cssText = "width:100%;min-height:360px;resize:vertical;box-sizing:border-box;font-family:Georgia,serif;line-height:1.7;font-size:16px;padding:16px";
      content.append(info, draftArea);
      return;
    }

    if (key === "sources") {
      const head = document.createElement("div");
      head.style.cssText = "display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px";
      const text = document.createElement("div");
      text.innerHTML = `<strong>Bölüme bağlı kaynaklar</strong><small style="display:block;opacity:.65;margin-top:3px">Literatürümden seç. Kaynağın uygunluk etiketi akademik kalite puanı değildir.</small>`;
      const count = document.createElement("strong");
      count.textContent = `${selectedIds.size} seçili`;
      head.append(text,count);
      const picker = v14OpenThesisSourcePicker(library, selectedIds, (id, checked) => {
        if (checked) selectedIds.add(id); else selectedIds.delete(id);
        current.sourceIds = [...selectedIds];
        count.textContent = `${selectedIds.size} seçili`;
      });
      content.append(head,picker);
      return;
    }

    if (key === "notes") {
      const two = document.createElement("div");
      two.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px";
      const advisorBox = document.createElement("div");
      advisorBox.style.cssText = "padding:14px;border:1px solid rgba(20,55,45,.12);border-radius:14px";
      const advisorLabel = document.createElement("strong"); advisorLabel.textContent = "Danışman / toplantı notları";
      advisorArea = document.createElement("textarea"); advisorArea.value = current.advisorNotes; advisorArea.placeholder = "Danışman geri bildirimi, toplantıda konuşulanlar, düzeltilecek noktalar..."; advisorArea.style.cssText = "width:100%;min-height:170px;margin-top:8px;box-sizing:border-box";
      advisorBox.append(advisorLabel,advisorArea);
      const tasksBox = document.createElement("div");
      tasksBox.style.cssText = "padding:14px;border:1px solid rgba(20,55,45,.12);border-radius:14px";
      const tasksLabel = document.createElement("strong"); tasksLabel.textContent = "Yapılacaklar / kontrol listesi";
      tasksArea = document.createElement("textarea"); tasksArea.value = current.tasks; tasksArea.placeholder = "Her satıra bir iş yaz:\n- Örneklem gerekçesini netleştir\n- Etik kurul bilgisini ekle\n- İki yöntem kaynağıyla karşılaştır"; tasksArea.style.cssText = "width:100%;min-height:170px;margin-top:8px;box-sizing:border-box";
      tasksBox.append(tasksLabel,tasksArea);
      two.append(advisorBox,tasksBox);

      const linkedNotes = document.createElement("div");
      linkedNotes.style.cssText = "margin-top:12px;padding:14px;border:1px solid rgba(20,55,45,.12);border-radius:14px";
      const noteHead = document.createElement("strong");
      noteHead.textContent = `Notlarım'dan bu bölüme bağlı notlar (${notes.length})`;
      linkedNotes.appendChild(noteHead);
      if (!notes.length) {
        const p = document.createElement("p"); p.textContent = "Henüz bu bölüme bağlı not yok."; linkedNotes.appendChild(p);
      } else {
        notes.forEach(note => {
          const row = document.createElement("div");
          row.style.cssText = "margin-top:9px;padding-top:9px;border-top:1px solid rgba(20,55,45,.08)";
          const t = document.createElement("strong"); t.textContent = note.title || "Not";
          const p = document.createElement("p"); p.textContent = shorten(note.text || "", 220); p.style.cssText = "margin:4px 0 0";
          row.append(t,p); linkedNotes.appendChild(row);
        });
      }
      content.append(two,linkedNotes);
    }
  }

  renderTabs();
  activateTab("plan");

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid rgba(20,55,45,.12)";
  const save = document.createElement("button");
  save.type = "button"; save.className = "primary"; save.textContent = "✓ Bölüm Çalışmasını Kaydet";
  const close = document.createElement("button");
  close.type = "button"; close.textContent = "Kapat";
  save.addEventListener("click", () => {
    captureCurrentTab();
    current.sourceIds = [...selectedIds];
    current.updatedAt = new Date().toISOString();
    const sections = v13GetThesisSections();
    sections[stage] = current;
    v13SetThesisSections(sections);
    const states = v12GetProgress();
    states[stage] = stateSelect.value;
    v12SetProgress(states);
    v12InitThesisWorkspace();
    v12RefreshDashboard();
    save.textContent = "✓ Kaydedildi";
    setTimeout(() => save.textContent = "✓ Bölüm Çalışmasını Kaydet", 1300);
  });
  close.addEventListener("click", () => panel.remove());
  actions.append(save,close);

  panel.append(hero,stats,evidence,tabs,content,actions);
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function v12InitThesisWorkspace() {
  const page = document.getElementById("thesis");
  const timeline = page?.querySelector(".timeline");
  if (!page || !timeline) return;
  let summary = page.querySelector("[data-v12-thesis-summary]");
  if (!summary) {
    summary = document.createElement("div"); summary.setAttribute("data-v12-thesis-summary", "1"); v12CardStyle(summary);
    timeline.parentNode.insertBefore(summary, timeline);
  }
  const research = getResearchProject();
  summary.innerHTML = research?.topic
    ? `<small style="font-weight:700;letter-spacing:.08em">🎯 AKTİF ARAŞTIRMA</small><strong style="display:block;margin:7px 0">${escapeAssistantHTML(research.topic)}</strong><span>${getLibrary().length} kaynak · ${getNotes().length} not · Tez ilerlemesi %${v12ThesisProgressPercent()}</span>`
    : `<strong>Henüz aktif araştırma yok</strong><p>Araştırma bölümünde konunu kaydettiğinde tez çalışma alanı onunla bağlanır.</p>`;

  const progress = v12GetProgress();
  [...timeline.children].forEach(card => {
    const stage = cleanValue(card.querySelector("strong")?.textContent);
    if (!stage) return;
    const small = card.querySelector("small");
    if (small) small.textContent = progress[stage] || "Başlanmadı";
    card.style.cursor = "pointer";
    card.title = `${stage} çalışma alanını aç`;
    let hint = card.querySelector("[data-v13-open-hint]");
    if (!hint) {
      hint = document.createElement("span");
      hint.setAttribute("data-v13-open-hint", "1");
      hint.textContent = "Çalışma alanını aç →";
      hint.style.cssText = "display:block;margin-top:12px;font-size:12px;font-weight:700;opacity:.72";
      card.appendChild(hint);
    }
  });

  if (!timeline.dataset.v13CaptureBound) {
    timeline.dataset.v13CaptureBound = "1";
    timeline.addEventListener("click", event => {
      const card = [...timeline.children].find(child =>
        child === event.target || child.contains(event.target)
      );
      if (!card) return;
      const stage = cleanValue(card.querySelector("strong")?.textContent);
      if (!stage) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      v13OpenThesisSection(stage);
    }, true);
  }
}

// =====================================================
// V13 — PROFESYONEL AI ASİSTAN CEVAP GÖRÜNÜMÜ
// =====================================================

function v13AppendInlineMarkdown(parent, text) {
  const value = String(text || "").replace(/__([^_]+)__/g, "**$1**");
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0, match;
  while ((match = regex.exec(value))) {
    if (match.index > last) parent.appendChild(document.createTextNode(value.slice(last, match.index)));
    const strong = document.createElement("strong"); strong.textContent = match[1]; parent.appendChild(strong);
    last = regex.lastIndex;
  }
  if (last < value.length) parent.appendChild(document.createTextNode(value.slice(last)));
}

function v13IsTableSeparator(line) {
  const cleaned = line.replace(/\|/g, "").replace(/:/g, "").replace(/-/g, "").trim();
  return cleaned === "" && /-/.test(line);
}

function v13RenderAssistantAnswer(text) {
  const root = document.createElement("div");
  root.className = "assistant-professional-answer";
  root.style.cssText = "display:grid;gap:14px;line-height:1.6";
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  let i = 0;
  let currentSection = null;

  function sectionHost() {
    if (currentSection) return currentSection;
    currentSection = document.createElement("section");
    currentSection.style.cssText = "padding:14px 16px;border:1px solid rgba(20,55,45,.12);border-radius:14px;background:rgba(255,255,255,.45)";
    root.appendChild(currentSection);
    return currentSection;
  }

  while (i < lines.length) {
    const raw = lines[i].trim();
    if (!raw) { i++; continue; }

    const headingMatch = raw.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      currentSection = document.createElement("section");
      currentSection.style.cssText = "padding:14px 16px;border:1px solid rgba(20,55,45,.12);border-radius:14px;background:rgba(255,255,255,.45)";
      const h = document.createElement("h3");
      h.style.cssText = "margin:0 0 9px;font-size:1.05em";
      v13AppendInlineMarkdown(h, headingMatch[1]);
      currentSection.appendChild(h);
      root.appendChild(currentSection);
      i++; continue;
    }

    if (raw.includes("|") && i + 1 < lines.length && v13IsTableSeparator(lines[i + 1].trim())) {
      const tableWrap = document.createElement("div");
      tableWrap.style.cssText = "overflow-x:auto;margin:8px 0";
      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse;font-size:.94em";
      const parseCells = line => line.split("|").map(x => x.trim()).filter((x, idx, arr) => !(x === "" && (idx === 0 || idx === arr.length - 1)));
      const headers = parseCells(raw);
      const trh = document.createElement("tr");
      headers.forEach(cell => { const th = document.createElement("th"); th.style.cssText = "text-align:left;padding:9px;border-bottom:1px solid rgba(20,55,45,.2)"; v13AppendInlineMarkdown(th, cell); trh.appendChild(th); });
      const thead = document.createElement("thead"); thead.appendChild(trh); table.appendChild(thead);
      const tbody = document.createElement("tbody");
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        const tr = document.createElement("tr");
        parseCells(lines[i].trim()).forEach(cell => { const td = document.createElement("td"); td.style.cssText = "vertical-align:top;padding:9px;border-bottom:1px solid rgba(20,55,45,.1)"; v13AppendInlineMarkdown(td, cell); tr.appendChild(td); });
        tbody.appendChild(tr); i++;
      }
      table.appendChild(tbody); tableWrap.appendChild(table); sectionHost().appendChild(tableWrap); continue;
    }

    if (/^[-•]\s+/.test(raw)) {
      const ul = document.createElement("ul");
      ul.style.cssText = "margin:7px 0;padding-left:22px";
      while (i < lines.length && /^[-•]\s+/.test(lines[i].trim())) {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        v13AppendInlineMarkdown(li, lines[i].trim().replace(/^[-•]\s+/, ""));
        ul.appendChild(li); i++;
      }
      sectionHost().appendChild(ul); continue;
    }

    const p = document.createElement("p");
    p.style.cssText = "margin:7px 0";
    v13AppendInlineMarkdown(p, raw.replace(/^---+$/, ""));
    if (p.textContent.trim()) sectionHost().appendChild(p);
    i++;
  }
  return root;
}

function appendAssistantMessage(role, text) {
  if (!assistantMessages) return;
  const message = document.createElement("div");
  message.className = `assistant-message ${role}`;
  if (role === "assistant") {
    const label = document.createElement("small");
    label.textContent = "ACADEMIC AI · KAYNAK TABANLI YANIT";
    label.style.cssText = "display:block;margin-bottom:10px;font-weight:800;letter-spacing:.06em;opacity:.72";
    message.append(label, v13RenderAssistantAnswer(text));
  } else {
    message.textContent = text;
  }
  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function v13AssistantBackendQuestion(question) {
  const normalized = normalizeSearchText(question);
  if (normalized.includes("kayitli arastirmamla karsilastir")) {
    return `Kayıtlı araştırma çerçevemi seçili literatür kaynaklarıyla karşılaştır. Kaynakları yalnızca birbirleriyle karşılaştırmak yerine, her bir kaynağın kayıtlı araştırmamın konusu, amacı, problemi, araştırma soruları ve anahtar kavramlarıyla ilişkisini değerlendir. Kullanıcıdan hangi kaynağı kastettiğini tekrar sorma. Seçili tüm kaynakları kullan. Bilgi eksikse açıkça belirt ve uydurma. Yanıtı şu profesyonel yapıda ver: ## Genel Değerlendirme, ## Araştırmamla En Güçlü Eşleşen Kaynaklar, ## Araştırma Sorularımla İlişki, ## Yöntem ve Örneklem Açısından Katkı, ## Bulgular Açısından Katkı, ## Eksik Kanıt / Dikkat, ## Tezimde Nasıl Kullanabilirim?. Kullanıcının isteği: ${question}`;
  }
  return question;
}

async function sendAssistantMessage() {
  const question = cleanValue(assistantInput?.value);
  if (!question) return;
  appendAssistantMessage("user", question);
  if (assistantInput) assistantInput.value = "";
  if (assistantSend) { assistantSend.disabled = true; assistantSend.textContent = "Yanıtlanıyor…"; }
  const sources = getAssistantSources();
  const research = getResearchProject();
  const thesis = getThesisProject();
  const notes = getNotes();
  const backendQuestion = v13AssistantBackendQuestion(question);
  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: backendQuestion, sources, research, thesis, notes })
    });
    let data;
    try { data = await response.json(); }
    catch { throw new Error("Academic AI sunucusundan geçerli bir yanıt alınamadı."); }
    if (!response.ok || !data.success) throw new Error(cleanPublicErrorMessage(data.message || "Yanıt oluşturulamadı."));
    appendAssistantMessage("assistant", data.answer || "Yanıt oluşturulamadı.");
  } catch (error) {
    appendAssistantMessage("assistant", "## Yanıt oluşturulamadı\n" + cleanPublicErrorMessage(error.message));
  } finally {
    if (assistantSend) { assistantSend.disabled = false; assistantSend.textContent = "Gönder"; }
    assistantInput?.focus();
  }
}

function v13InitAll() {
  v12InitPapers();
  v12InitNotes();
  v12InitThesisWorkspace();
  v12InitCitations();
  v12InitAssistant();
  v12RefreshDashboard();
}

setTimeout(v13InitAll, 20);
document.addEventListener("click", event => {
  const nav = event.target.closest?.("[data-go], .nav-item");
  if (nav) setTimeout(v13InitAll, 20);
});

console.log("✓ Academic AI V13 toplu düzeltme aktif.");

// =====================================================
// ACADEMIC AI — ANA PANEL V16
// Referans dashboard'u gerçek localStorage verileriyle besler.
// =====================================================

function aaHomeText(value, fallback = "—") {
  const v = cleanValue(value);
  return v || fallback;
}

function aaHomeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function aaHomeYear(source) {
  const raw = source?.year ?? source?.publicationYear ?? source?.meta?.year ?? source?.meta?.publicationYear;
  const match = String(raw || "").match(/(?:19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function aaHomeAuthors(source) {
  const raw = source?.authors ?? source?.author ?? source?.meta?.authors ?? source?.meta?.author;
  if (Array.isArray(raw)) return raw.map(x => typeof x === "string" ? x : x?.name).filter(Boolean).join(", ");
  return aaHomeText(raw, "Yazar bilgisi yok");
}

function aaHomeCitationCount(source) {
  const candidates = [source?.citationCount, source?.citedByCount, source?.cited_by_count, source?.meta?.citationCount, source?.meta?.citedByCount];
  const n = candidates.map(Number).find(Number.isFinite);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function aaHomeMethodLabel(source) {
  const text = normalizeSearchText(source?.method || source?.researchDesign || "");
  if (!text) return "Belirsiz";
  if (text.includes("karma") || text.includes("mixed")) return "Karma";
  if (text.includes("nicel") || text.includes("quantitative") || text.includes("anket") || text.includes("survey")) return "Nicel";
  if (text.includes("nitel") || text.includes("qualitative") || text.includes("gorus") || text.includes("interview") || text.includes("tematik")) return "Nitel";
  return "Diğer";
}

function aaHomeKeywords(source) {
  const values = [
    ...aaHomeArray(source?.keywords),
    ...aaHomeArray(source?.meta?.keywords),
    ...aaHomeArray(source?.concepts)
  ];
  const seen = new Set();
  return values.map(v => cleanValue(typeof v === "string" ? v : v?.name)).filter(v => {
    const key = normalizeSearchText(v);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function aaHomeThesisState() {
  const stages = ["Giriş", "Literatür", "Yöntem", "Veri & Analiz", "Sonuç"];
  let progress = {};
  try {
    if (typeof v12GetProgress === "function") progress = v12GetProgress() || {};
  } catch {}

  const values = stages.map(stage => {
    const state = cleanValue(progress?.[stage]);
    if (state === "Tamamlandı") return 100;
    if (state === "Devam ediyor") return 55;
    return 0;
  });

  let percent = 0;
  try {
    if (typeof v12ThesisProgressPercent === "function") percent = Number(v12ThesisProgressPercent()) || 0;
  } catch {}
  if (!percent) percent = Math.round(values.reduce((a,b)=>a+b,0) / values.length);

  return { stages, values, percent: Math.max(0, Math.min(100, percent)), completed: values.filter(v => v === 100).length };
}

function aaHomeResearchSectionCount() {
  try {
    if (typeof v13GetThesisSections === "function") {
      const sections = v13GetThesisSections() || {};
      const names = ["Giriş", "Literatür", "Yöntem", "Veri & Analiz", "Sonuç"];
      const filled = names.filter(name => {
        const item = sections[name] || {};
        return cleanValue(item.draft || item.text) || Object.values(item.fields || {}).some(v => cleanValue(v));
      }).length;
      return filled;
    }
  } catch {}
  return 0;
}

function aaRenderHomeRecentSources(library) {
  const root = document.getElementById("homeRecentSources");
  if (!root) return;
  root.innerHTML = "";
  if (!library.length) {
    root.innerHTML = '<div class="dashboard-empty-row">Henüz kaynak eklenmedi. İlk kaynağını Literatürüm veya Makalelerim bölümünden ekleyebilirsin.</div>';
    return;
  }

  library.slice().reverse().slice(0, 5).forEach((source, index) => {
    const row = document.createElement("div");
    row.className = "recent-source-row";
    const method = aaHomeMethodLabel(source);
    const fitClass = index < 2 ? "" : index < 4 ? "medium" : "low";
    const fitText = index < 2 ? "Çok Uygun" : index < 4 ? "Uygun" : "Orta";
    row.innerHTML = `
      <span class="source-file-icon">${index % 2 ? "▱" : "▤"}</span>
      <div class="recent-source-main">
        <strong>${escapeAssistantHTML(aaHomeText(source?.title || source?.fileName, "Başlıksız kaynak"))}</strong>
        <small>${escapeAssistantHTML(aaHomeAuthors(source))}${method !== "Belirsiz" ? ` · ${escapeAssistantHTML(method)}` : ""}</small>
      </div>
      <span class="source-fit ${fitClass}">${fitText}</span>
      <span class="source-year">${aaHomeYear(source) || "—"}</span>`;
    root.appendChild(row);
  });
}

function aaRenderHomeThesis() {
  const state = aaHomeThesisState();
  const ring = document.getElementById("homeThesisRing");
  if (ring) ring.style.setProperty("--p", state.percent);
  const percent = document.getElementById("homeThesisPercent");
  if (percent) percent.textContent = `%${state.percent}`;
  const mini = document.getElementById("homeThesisMiniProgress");
  if (mini) mini.textContent = `İlerleme %${state.percent}`;
  const completed = document.getElementById("homeThesisCompletedText");
  if (completed) completed.textContent = `${state.completed} / ${state.stages.length} bölüm tamamlandı`;

  const root = document.getElementById("homeThesisStages");
  if (!root) return;
  root.innerHTML = "";
  state.stages.forEach((stage, i) => {
    const pct = state.values[i];
    const row = document.createElement("div");
    row.className = "thesis-stage";
    row.innerHTML = `<span>${escapeAssistantHTML(stage)}</span><span class="stage-track"><i style="width:${pct}%"></i></span><span class="stage-percent">${pct}%</span>`;
    root.appendChild(row);
  });
}

function aaRenderHomeOverview(library) {
  const years = library.map(aaHomeYear).filter(Boolean);
  const counts = {};
  years.forEach(y => counts[y] = (counts[y] || 0) + 1);
  const sortedYears = Object.keys(counts).map(Number).sort((a,b)=>a-b).slice(-7);
  const bars = document.getElementById("homeYearBars");
  if (bars) {
    bars.innerHTML = "";
    const max = Math.max(1, ...sortedYears.map(y => counts[y]));
    if (!sortedYears.length) bars.innerHTML = '<span style="height:12%"><b>—</b></span><span style="height:18%"></span><span style="height:10%"></span><span style="height:15%"></span>';
    else sortedYears.forEach(y => {
      const span = document.createElement("span");
      span.style.height = `${Math.max(12, Math.round((counts[y] / max) * 95))}%`;
      span.innerHTML = `<b>${y}</b>`;
      span.title = `${y}: ${counts[y]} kaynak`;
      bars.appendChild(span);
    });
  }

  const methods = { Nitel:0, Nicel:0, Karma:0, Diğer:0, Belirsiz:0 };
  library.forEach(s => methods[aaHomeMethodLabel(s)]++);
  const total = Math.max(1, library.length);
  const nitel = Math.round((methods.Nitel/total)*100);
  const nicel = Math.round((methods.Nicel/total)*100);
  const karma = Math.round((methods.Karma/total)*100);
  const donut = document.getElementById("homeMethodDonut");
  if (donut && library.length) donut.style.background = `conic-gradient(#39a66d 0 ${nitel}%,#e7ad47 ${nitel}% ${nitel+nicel}%,#8f6fd1 ${nitel+nicel}% ${nitel+nicel+karma}%,#d9dee3 ${nitel+nicel+karma}% 100%)`;
  const legend = document.getElementById("homeMethodLegend");
  if (legend) legend.innerHTML = library.length ? `● Nitel %${nitel}<br>● Nicel %${nicel}<br>● Karma %${karma}` : "Henüz yöntem verisi yok";

  const keywordCounts = new Map();
  library.forEach(s => aaHomeKeywords(s).forEach(k => {
    const key = normalizeSearchText(k);
    const item = keywordCounts.get(key) || { label:k, count:0 };
    item.count += 1; keywordCounts.set(key,item);
  }));
  const themes = [...keywordCounts.values()].sort((a,b)=>b.count-a.count).slice(0,5);
  const tags = document.getElementById("homeThemeTags");
  if (tags) tags.innerHTML = themes.length ? themes.map(x => `<span>${escapeAssistantHTML(x.label)}</span>`).join("") : "<span>Henüz veri yok</span>";

  const citationValues = library.map(aaHomeCitationCount).filter(Number.isFinite);
  const avg = citationValues.length ? (citationValues.reduce((a,b)=>a+b,0)/citationValues.length).toFixed(1) : "—";
  const avgEl = document.getElementById("homeAverageCitation");
  if (avgEl) avgEl.textContent = avg;
}

function aaRenderHomeDetail(library, research) {
  const source = library.slice().reverse()[0];
  const title = document.getElementById("homeDetailTitle");
  const meta = document.getElementById("homeDetailMeta");
  const fit = document.getElementById("homeDetailFit");
  if (!source) {
    if (title) title.textContent = "Henüz seçili kaynak yok";
    if (meta) meta.textContent = "Literatürüne kaynak eklediğinde burada öne çıkan kaynağı göreceksin.";
    return;
  }

  if (title) title.textContent = aaHomeText(source.title || source.fileName, "Başlıksız kaynak");
  const year = aaHomeYear(source);
  if (meta) meta.textContent = `${aaHomeAuthors(source)}${year ? ` (${year})` : ""}${source?.journal || source?.source ? ` · ${aaHomeText(source.journal || source.source)}` : ""}`;
  if (fit) fit.textContent = "Çok Uygun";

  const basics = document.getElementById("homeDetailBasics");
  if (basics) basics.innerHTML = `
    <div><dt>Araştırma Amacı</dt><dd>${escapeAssistantHTML(shorten(aaHomeText(source?.purpose),150))}</dd></div>
    <div><dt>Yöntem</dt><dd>${escapeAssistantHTML(shorten(aaHomeText(source?.method),90))}</dd></div>
    <div><dt>Örneklem</dt><dd>${escapeAssistantHTML(shorten(aaHomeText(source?.sample),90))}</dd></div>
    <div><dt>Yıl</dt><dd>${year || "—"}</dd></div>`;

  const kws = aaHomeKeywords(source).slice(0,6);
  const kwRoot = document.getElementById("homeDetailKeywords");
  if (kwRoot) kwRoot.innerHTML = kws.length ? kws.map(k => `<span>${escapeAssistantHTML(k)}</span>`).join("") : "<span>—</span>";

  const use = document.getElementById("homeDetailUse");
  if (use) {
    const researchTopic = cleanValue(research?.topic);
    const hasMethod = cleanValue(source?.method);
    const hasFindings = aaHomeArray(source?.findings).length;
    use.textContent = hasFindings ? "Literatür ve tartışma bölümünde bulguları kendi araştırma sonuçlarınla karşılaştırmak için kullanılabilir." : hasMethod ? "Yöntem bölümünde benzer araştırma tasarımlarıyla karşılaştırma yapmak için incelenebilir." : researchTopic ? "Literatür taramasında araştırma konunla ilişkisini değerlendirmek için incelenebilir." : "Kaynağın tezdeki kullanım yerini netleştirmek için analiz alanlarını tamamla.";
  }

  const cites = aaHomeCitationCount(source);
  const citeEl = document.getElementById("homeDetailCitations");
  if (citeEl) citeEl.textContent = cites ?? "—";
  const yearly = document.getElementById("homeDetailYearly");
  if (yearly) {
    if (cites != null && year) {
      const age = Math.max(1, new Date().getFullYear() - year + 1);
      yearly.textContent = (cites / age).toFixed(1);
    } else yearly.textContent = "—";
  }
}

function aaRefreshHomeDashboard() {
  const home = document.getElementById("home");
  if (!home) return;
  const library = typeof getLibrary === "function" ? getLibrary() : [];
  const notes = typeof getNotes === "function" ? getNotes() : [];
  const research = typeof getResearchProject === "function" ? getResearchProject() : null;
  const thesis = aaHomeThesisState();

  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set("literatureCount", library.length);
  set("paperCount", library.length);
  set("noteCount", notes.length);
  set("homeResearchSourceCount", library.length);
  set("homeResearchPaperCount", library.length);
  set("homeResearchNoteCount", notes.length);
  set("homeResearchSectionCount", `${aaHomeResearchSectionCount()} / 5`);
  set("homeResearchProgressText", `%${thesis.percent}`);
  const bar = document.getElementById("homeResearchProgressBar"); if (bar) bar.style.width = `${thesis.percent}%`;

  const title = document.getElementById("homeResearchTitle");
  const subtitle = document.getElementById("homeResearchSubtitle");
  if (title) title.textContent = research?.topic ? shorten(research.topic, 90) : "Henüz araştırma projesi yok";
  if (subtitle) subtitle.textContent = research?.purpose ? shorten(research.purpose, 100) : "Araştırma konunu yapılandırarak çalışma alanını başlat.";

  aaRenderHomeRecentSources(library);
  aaRenderHomeThesis();
  aaRenderHomeOverview(library);
  aaRenderHomeDetail(library, research);

  const recommended = document.getElementById("homeRecommendedSource");
  if (recommended) {
    const source = library.slice().reverse()[1] || library.slice().reverse()[0];
    if (source) recommended.innerHTML = `<span class="recommended-icon">▤</span><div><strong>${escapeAssistantHTML(aaHomeText(source.title || source.fileName,"Başlıksız kaynak"))}</strong><small>${escapeAssistantHTML(aaHomeAuthors(source))}${aaHomeYear(source) ? ` · ${aaHomeYear(source)}` : ""}</small></div>`;
    else if (research?.topic) recommended.innerHTML = `<span class="recommended-icon">⌕</span><div><strong>${escapeAssistantHTML(shorten(research.topic,80))}</strong><small>Bu konu için Literatürüm bölümünden kaynak aramaya başlayabilirsin.</small></div>`;
  }
}

setTimeout(aaRefreshHomeDashboard, 30);
document.addEventListener("click", event => {
  if (event.target.closest?.("[data-go], .nav-item")) setTimeout(aaRefreshHomeDashboard, 40);
});
window.addEventListener("storage", aaRefreshHomeDashboard);
