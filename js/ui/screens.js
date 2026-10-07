/* GeoMind — рендеринг экранов.
 * Главный экран, настройка тренировки (категория + сложность + режим),
 * тренировка (классика / бесконечный режим / повторение ошибок),
 * экран результата и экран «Статистика» (общие результаты, разбивка
 * по сложности и категориям, история, «Мои ошибки»).
 * Игровая логика — в core/training.js, статистика — в core/stats.js,
 * уровни — в core/levels.js, сложности — в data/difficulties.js.
 */
(function () {
  const Config = window.GeoMind.Config;
  const Dom = window.GeoMind.Dom;
  const Stats = window.GeoMind.Stats;
  const Levels = window.GeoMind.Levels;
  const Difficulties = window.GeoMind.Difficulties;
  const Categories = window.GeoMind.Categories;
  const FlagImage = window.GeoMind.FlagImage;
  const h = Dom.h;

  // Таймер автоперехода в бесконечном режиме (глобальный для экрана)
  let autoTimer = null;

  function clearAuto() {
    if (autoTimer != null) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function appEl() {
    return document.getElementById("app");
  }

  function mount(node) {
    const root = appEl();
    root.textContent = "";
    root.appendChild(node);
    window.scrollTo({ top: 0, left: 0 });
  }

  /* ================= Вспомогательное ================= */

  function catOf(id) {
    return Categories.find((c) => c.id === id);
  }

  function diffOf(id) {
    return Difficulties.find((d) => d.id === id);
  }

  function levelInfo(xp) {
    return Levels.getInfo(xp);
  }

  /** Полоса прогресса уровня. pct — 0..100. */
  function levelBar(pct) {
    const p = Math.max(0, Math.min(100, pct));
    return h("div", {
      class: "levelbar",
      role: "progressbar",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": String(Math.round(p)),
    },
      h("div", { class: "levelbar-fill", style: `width:${p}%` }),
    );
  }

  function streakLabel(n) {
    if (n <= 0) return "🔥 Серия ещё не начата";
    return `🔥 ${n} ${Dom.plural(n, "день", "дня", "дней")} подряд`;
  }

  function statTile(emoji, value, label) {
    return h("div", { class: "stat-tile" },
      h("div", { class: "stat-emoji", text: emoji }),
      h("div", { class: "stat-value", text: String(value) }),
      h("div", { class: "stat-label", text: label }),
    );
  }

  function groupSummary(info, withTime) {
    const acc = info.accuracy == null ? "—" : `${info.accuracy}%`;
    const qty = `${info.questions} ${Dom.plural(info.questions, "вопрос", "вопроса", "вопросов")}`;
    if (withTime) {
      const t = info.avgTime == null ? "—" : Dom.fmtTime(info.avgTime);
      return { acc: acc, more: `· ${qty} · ⏱ ${t}` };
    }
    return { acc: acc, more: `· ${qty}` };
  }

  const CURRENCY_FACT_LABEL = {
    name: "Валюта",
    code: "Код ISO",
    symbol: "Символ",
  };

  /** Чипы с данными о валюте в карточке вопроса. */
  function currencyFactsEl_(facts) {
    if (!Array.isArray(facts) || facts.length === 0) return null;
    return h("div", { class: "currency-facts" },
      facts.map((f) =>
        h("div", { class: `currency-fact currency-fact-${f.kind}` },
          h("span", { class: "currency-fact-label", text: CURRENCY_FACT_LABEL[f.kind] || "" }),
          h("span", { class: "currency-fact-value", text: f.value }),
        ),
      ),
    );
  }

  function catDiffLabel(category, difficulty, withCatEmoji) {
    const catLabel = `${withCatEmoji ? `${category.emoji} ` : ""}${category.title}`;
    if (difficulty) return `${catLabel} · ${difficulty.emoji} ${difficulty.title}`;
    return catLabel;
  }

  /** Режимы тренировки для экрана настройки. */
  function buildModes() {
    const modes = Config.QUESTION_OPTIONS.map((count) => ({
      mode: "classic",
      count: count,
      emoji: "🎯",
      label: `${count} вопросов`,
    }));
    modes.push({ mode: "infinite", count: null, emoji: "♾️", label: "Бесконечный" });
    return modes;
  }

  /* ================= Главный экран ================= */

  function renderHome() {
    const stats = Stats.get();
    const accuracy = Stats.accuracy();
    const info = levelInfo(stats.xp);
    const hasData = stats.totalQuestions > 0;

    const hero = h("header", { class: "hero" },
      h("h1", { class: "logo", text: Config.APP_NAME }),
      h("p", { class: "tagline", text: Config.TAGLINE }),
    );

    // — Карточка уровня и серии —
    const levelCaption = info.isMax
      ? "🏆 Максимальный уровень достигнут!"
      : `${info.toNext} XP до уровня ${info.level + 1}`;

    const profile = h("section", { class: "card profile-card" },
      h("div", { class: "profile-top" },
        h("span", { class: "profile-streak", text: streakLabel(stats.streak) }),
        h("button", { class: "link-btn", onclick: renderStats },
          h("span", { text: "Статистика" }),
          h("span", { class: "link-arrow", text: "→" }),
        ),
      ),
      h("div", { class: "profile-level-row" },
        h("div", { class: "profile-level", text: `🌍 Уровень ${info.level}` }),
        h("div", { class: "profile-xp", text: `⭐ ${stats.xp} XP` }),
      ),
      levelBar(info.progress * 100),
      h("div", { class: "level-caption", text: levelCaption }),
    );

    // — Блок тренировки (открывает настройку) —
    const trainCard = h("div", { class: "card train-card" },
      h("div", { class: "train-row" },
        h("span", { class: "train-emoji", text: "🎯" }),
        h("div", { class: "train-info" },
          h("div", { class: "train-name", text: "Новая тренировка" }),
          h("div", {
            class: "train-meta",
            text: "выбери категорию, сложность и режим",
          }),
        ),
      ),
      h("button", { class: "btn btn-primary btn-start", onclick: () => renderSetup() },
        h("span", { text: "Начать тренировку" }),
        h("span", { class: "btn-arrow", text: "→" }),
      ),
    );

    const trainingSection = h("section", { class: "train-section" },
      h("h2", { class: "section-title", text: "Тренировка" }),
      trainCard,
    );

    // — Мини-статистика —
    const miniStats = h("section", { class: "mini-stats" },
      h("h2", { class: "section-title", text: "Твоя статистика" }),
      h("div", { class: "card stats-card" },
        h("div", { class: "stats-grid stats-grid-3" },
          statTile("🎯", `${accuracy}%`, "Точность"),
          statTile("🧠", hasData ? stats.totalQuestions : 0, "Вопросов"),
          statTile("⏱", stats.avgTime == null ? "—" : Dom.fmtTime(stats.avgTime), "Среднее время"),
        ),
        h("button", { class: "btn btn-ghost btn-view-stats", onclick: renderStats },
          h("span", { text: "Смотреть статистику" }),
          h("span", { class: "btn-arrow", text: "→" }),
        ),
      ),
    );

    // — Категории —
    const categoryList = h("div", { class: "category-list" },
      Categories.map((cat) => {
        const body = h("div", { class: "category-body" },
          h("div", { class: "category-name", text: cat.title }),
          h("div", { class: "category-desc", text: cat.desc }),
        );
        if (cat.locked) {
          return h("div", { class: "category category-locked", "aria-disabled": "true" },
            h("div", { class: "category-emoji", text: cat.emoji }),
            body,
            h("span", { class: "badge badge-soon", text: "Скоро" }),
          );
        }
        return h("div", {
          class: "category category-active",
          role: "button",
          tabindex: "0",
          onclick: () => renderSetup(cat.id),
          onkeydown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              renderSetup(cat.id);
            }
          },
        },
          h("div", { class: "category-emoji", text: cat.emoji }),
          body,
          h("span", { class: "badge badge-open", text: "Доступна" }),
        );
      }),
    );

    const categories = h("section", { class: "categories" },
      h("h2", { class: "section-title", text: "Категории" }),
      categoryList,
    );

    mount(h("div", { class: "screen screen-home" },
      hero, profile, trainingSection, miniStats, categories));
  }

  /* ================= Экран настройки тренировки ================= */

  function renderSetup(preferredCategoryId) {
    const available = Categories.filter((c) => !c.locked);
    const modes = buildModes();
    let catId = available.some((c) => c.id === preferredCategoryId)
      ? preferredCategoryId
      : available[0].id;
    let diffId = "medium"; // по умолчанию — средняя
    let modeKey = modes[0].label; // по умолчанию — 10 вопросов

    const root = h("div", { class: "screen screen-setup" });
    mount(root);

    function selectedMode() {
      return modes.find((m) => m.label === modeKey) || modes[0];
    }

    function paint() {
      const back = h("button", { class: "btn btn-back", onclick: renderHome },
        h("span", { class: "back-arrow", text: "←" }),
        h("span", { text: "На главную" }),
      );

      // Категории
      const catSection = h("section", { class: "setup-section" },
        h("h2", { class: "section-title", text: "🌍 Выбери категорию" }),
        h("div", { class: "setup-list" },
          available.map((cat) => {
            const selected = cat.id === catId;
            return h("div", {
              class: `sel-card${selected ? " sel-card-on" : ""}`,
              role: "radio",
              tabindex: "0",
              "aria-checked": selected ? "true" : "false",
              onclick: () => { catId = cat.id; paint(); },
              onkeydown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  catId = cat.id;
                  paint();
                }
              },
            },
              h("span", { class: "sel-emoji", text: cat.emoji }),
              h("div", { class: "sel-body" },
                h("div", { class: "sel-title", text: cat.title }),
                h("div", { class: "sel-desc", text: cat.desc }),
              ),
              selected ? h("span", { class: "sel-check", text: "✓" }) : null,
            );
          }),
        ),
      );

      // Сложность
      const diffSection = h("section", { class: "setup-section" },
        h("h2", { class: "section-title", text: "🎯 Выбери сложность" }),
        h("div", { class: "diff-grid" },
          Difficulties.map((d) => {
            const selected = d.id === diffId;
            return h("div", {
              class: `sel-card diff-card${selected ? " sel-card-on" : ""}`,
              role: "radio",
              tabindex: "0",
              "aria-checked": selected ? "true" : "false",
              onclick: () => { diffId = d.id; paint(); },
              onkeydown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  diffId = d.id;
                  paint();
                }
              },
            },
              h("div", { class: "diff-head" },
                h("span", { class: "diff-emoji", text: d.emoji }),
                h("span", { class: "diff-title", text: d.title }),
              ),
              h("div", { class: "diff-xp", text: `+${d.xpPerCorrect} XP за правильный ответ` }),
              h("div", { class: "diff-desc", text: d.desc }),
              selected ? h("span", { class: "sel-check", text: "✓" }) : null,
            );
          }),
        ),
      );

      // Режим
      const modeSection = h("section", { class: "setup-section" },
        h("h2", { class: "section-title", text: "🎮 Выбери режим" }),
        h("div", { class: "mode-grid" },
          modes.map((m) => {
            const selected = m.label === modeKey;
            return h("div", {
              class: `sel-card mode-card${selected ? " sel-card-on" : ""}`,
              role: "radio",
              tabindex: "0",
              "aria-checked": selected ? "true" : "false",
              onclick: () => { modeKey = m.label; paint(); },
              onkeydown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  modeKey = m.label;
                  paint();
                }
              },
            },
              h("span", { class: "mode-emoji", text: m.emoji }),
              h("span", { class: "mode-title", text: m.label }),
              selected ? h("span", { class: "sel-check", text: "✓" }) : null,
            );
          }),
        ),
      );

      const start = h("button", {
        class: "btn btn-primary btn-start-setup",
        onclick: () => {
          const cat = catOf(catId);
          const diff = diffOf(diffId);
          const mode = selectedMode();
          if (cat && diff) renderTraining(cat, diff, { mode: mode.mode, count: mode.count });
        },
      },
        h("span", { text: "Начать тренировку" }),
        h("span", { class: "btn-arrow", text: "→" }),
      );

      root.textContent = "";
      root.append(back, catSection, diffSection, modeSection, start);
      window.scrollTo({ top: 0, left: 0 });
    }

    paint();
  }

  /* ================= Экран тренировки ================= */

  function renderTraining(category, difficulty, trainOpts) {
    const options = trainOpts || {};
    let session;
    if (options.mistakes) {
      // Повторение ошибок: вопросы из «Моих ошибок» (смешанные категории)
      const mistakes = Stats.get().mistakes.slice(0, 10);
      if (mistakes.length === 0) {
        renderHome();
        return;
      }
      const questions = window.GeoMind.Questions.buildFromMistakes(mistakes);
      const pseudoCat = { id: "mistakes", emoji: "🧠", title: "Мои ошибки" };
      const pseudoDiff = { id: "mix", emoji: "🔁", title: "Повторение", xpPerCorrect: 30 };
      session = window.GeoMind.Training.createSession(pseudoCat, pseudoDiff, {
        mode: "mistakes",
        questions: questions,
      });
    } else {
      const mode = options.mode === "infinite" ? "infinite" : "classic";
      const count = options.count || Config.QUESTIONS_PER_TRAINING;
      session = window.GeoMind.Training.createSession(category, difficulty, { mode: mode, count: count });
    }

    const root = h("div", { class: "screen screen-training" });
    mount(root);
    renderQuestion(session, root);
  }

  /* ================= Подтверждение выхода из тренировки ================= */

  /**
   * Открывает модалку «Вы действительно хотите выйти? Прогресс текущей
   * тренировки будет потерян». Если пользователь отменяет выход —
   * мягко возобновляет авто-переход бесконечного режима, чтобы экран
   * не «завис» между вопросами.
   */
  function openExitConfirm(session, root) {
    clearAuto();
    let keyHandler = null;

    function resumeAuto() {
      const q = session.current();
      if (session.mode === "infinite" && q && q.answered && document.querySelector(".screen-training")) {
        autoTimer = setTimeout(() => {
          autoTimer = null;
          if (document.querySelector(".screen-training")) {
            session.advance();
            renderQuestion(session, root);
          }
        }, 1400);
      }
    }

    function close() {
      overlay.remove();
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
    }

    const overlay = h("div", {
      class: "modal-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Подтверждение выхода из тренировки",
      onclick: (e) => {
        if (e.target === overlay) { close(); resumeAuto(); }
      },
    },
      h("div", { class: "modal-card" },
        h("div", { class: "modal-emoji", text: "🚪" }),
        h("h3", { class: "modal-title", text: "Вы действительно хотите выйти?" }),
        h("p", { class: "modal-text", text: "Прогресс текущей тренировки будет потерян" }),
        h("div", { class: "modal-actions" },
          h("button", {
            class: "btn btn-danger btn-modal-exit",
            onclick: () => { close(); renderHome(); },
          }, "Выйти"),
          h("button", {
            class: "btn btn-ghost btn-modal-stay",
            onclick: () => { close(); resumeAuto(); },
          }, "Продолжить тренировку"),
        ),
      ),
    );

    keyHandler = (e) => {
      if (e.key === "Escape") { close(); resumeAuto(); }
    };
    document.addEventListener("keydown", keyHandler);

    document.body.appendChild(overlay);
  }

  function renderQuestion(session, root) {
    clearAuto();
    const q = session.current();
    if (!q) {
      finishTraining(session);
      return;
    }
    const isInfinite = session.mode === "infinite";

    // Категория · сложность · режим и награда
    const crumbText = isInfinite
      ? "♾️ Бесконечный режим"
      : session.isMistakes
        ? "🧠 Мои ошибки · Повторение"
        : catDiffLabel(session.category, session.difficulty, true);
    const rewardText = session.isMistakes
      ? "⭐ до +30 XP"
      : `⭐ +${session.difficulty.xpPerCorrect} XP`;

    const exitBtn = h("button", {
      class: "btn btn-exit",
      "aria-label": "Выйти в главное меню",
      title: "Выйти в главное меню",
      onclick: () => openExitConfirm(session, root),
    },
      h("span", { class: "btn-exit-x", text: "✕" }),
      h("span", { class: "btn-exit-label", text: "Выйти" }),
    );

    const meta = h("div", { class: "training-meta" },
      h("span", { class: "train-crumb", text: crumbText }),
      h("div", { class: "training-meta-right" },
        h("span", { class: "reward-chip", text: rewardText }),
        exitBtn,
      ),
    );

    let middle;
    if (isInfinite) {
      const answered = session.answeredCount;
      const acc = answered ? Math.round((session.correctCount / answered) * 100) : null;
      const avg = session.avgTimeNow;
      const chip = (emoji, label, value) =>
        h("span", { class: "inf-chip" },
          h("b", { text: `${emoji} ${value}` }),
          h("span", { text: label }),
        );
      middle = h("div", { class: "inf-stats" },
        h("div", { class: "inf-chips" },
          chip("❓", "Вопросов", answered),
          chip("🔥", "Серия", session.currentStreak),
          chip("⭐", "XP", session.xpEarned),
          chip("🎯", "Точность", acc == null ? "—" : `${acc}%`),
          chip("⏱", "Среднее", avg == null ? "—" : Dom.fmtTime(avg)),
        ),
      );
    } else {
      const n = session.index + 1;
      const total = session.total;
      const header = h("div", { class: "training-header" },
        h("span", { class: "question-counter", text: `Вопрос ${n} / ${total}` }),
      );
      const progress = h("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(n) },
        Array.from({ length: total }, (_, i) =>
          h("div", { class: `pseg${i < n ? " pseg-on" : ""}`, style: `--i:${i}` }),
        ),
      );
      middle = h("div", {}, header, progress);
    }      // — Карточка вопроса —
      // Флаг показывается, только если он НЕ является правильным ответом
      // (q.showFlag). Иначе вопрос подсказывал бы сам себя.
      const questionFlagEl = q.showFlag
        ? FlagImage({ country: q.country, alt: `Флаг: ${q.country}` })
        : null;

      // Название страны в карточке (для вопросов про валюты).
      const questionCountryEl = q.showCountryName
        ? h("div", { class: "question-country", text: q.country })
        : null;

      // Чипы «Валюта / Код / Символ». Тип вопроса сам решает, что безопасно
      // показать, чтобы не выдать ответ (см. js/data/questions.js).
      const currencyFactsEl = currencyFactsEl_(q.currencyFacts);

      const questionCard = h(
        "div",
        { class: `card question-card${q.showFlag ? " flag-card" : ""}` },
        questionFlagEl,
        questionCountryEl,
        h("h2", { class: "question-text", text: q.promptText }),
        currencyFactsEl,
      );

      // — Варианты ответа —
      // optionType === "flag": вариант — название страны, рисуется SVG-флагом.
      // optionType === "text":  вариант — текст (страна или столица).
      const answers = h("div", { class: "answers" },
        q.options.map((option, i) => {
          const labelSpan = h("span", { class: "answer-letter", text: Config.ANSWER_LABELS[i] });
          const valueSpan = q.optionType === "flag"
            ? FlagImage({ country: option, alt: `Флаг: ${option}`, variant: "option" })
            : h("span", { class: "answer-text", text: option });
          return h("button", {
            class: "btn answer-btn",
            "data-index": String(i),
            onclick: () => handleAnswer(session, i, root),
          }, labelSpan, valueSpan);
        }),
      );

    const children = [meta, middle, questionCard, answers];
    if (isInfinite) {
      children.push(h("button", {
        class: "btn btn-ghost btn-finish",
        onclick: () => finishTraining(session),
      }, "Завершить тренировку"));
    }

    root.textContent = "";
    root.append(...children);
    session.startTimer();
  }

  function handleAnswer(session, optionIndex, root) {
    const q = session.current();
    const result = session.answer(optionIndex);
    if (!result) return; // вопрос уже отвечен — защита от двойного ответа

    // Подсвечиваем кнопки: правильный ответ зелёным, выбранный неверный — красным
    const buttons = root.querySelectorAll(".answer-btn");
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === optionIndex && !result.isCorrect) {
        btn.classList.add("answer-wrong");
      } else if (q.options[i] === q.correctText) {
        btn.classList.add("answer-correct");
      } else {
        btn.classList.add("answer-dim");
      }
    });

    const isInfinite = session.mode === "infinite";
    const xpLine = result.isCorrect
      ? h("div", { class: "feedback-xp", text: `+${result.reward} XP` })
      : h("div", { class: "feedback-xp feedback-xp-zero", text: "+0 XP" });

    let nextBtn = null;
    const canGoNext = true;
    if (canGoNext) {
      const nextLabel = (session.mode === "mistakes" || session.isLast) ? "Показать результат →" : "Следующий вопрос →";
      nextBtn = h("button", {
        class: "btn btn-primary btn-next",
        disabled: true,
        onclick: () => onNext(session, root),
      }, (session.mode === "mistakes" || session.isLast) ? "Показать результат →" : "Следующий вопрос →");;
    }

    const feedback = h("div", {
      class: `feedback ${result.isCorrect ? "feedback-good" : "feedback-bad"}`,
      role: "status",
    },
      h("div", { class: "feedback-title", text: result.isCorrect ? "✅ Правильно!" : "❌ Неправильно" }),
      xpLine,
      h("div", { class: "feedback-answer" },
        h("span", { class: "feedback-answer-label", text: "Правильный ответ:" }),
        h("span", { class: "feedback-answer-value", text: result.correctLabel }),
      ),
      h("div", { class: "feedback-time", text: `⏱ ${Dom.fmtTime(result.elapsedSec)}` }),
      nextBtn,
    );

    root.append(feedback);

    if (isInfinite) {
      // Бесконечный режим: короткий фидбек, затем автоматический переход
      autoTimer = setTimeout(() => {
        autoTimer = null;
        if (document.querySelector(".screen-training")) {
          session.advance();
          renderQuestion(session, root);
        }
      }, 1400);
    } else {
      // Короткая пауза перед активацией кнопки «Следующий вопрос»
      setTimeout(() => {
        nextBtn.disabled = false;
        nextBtn.classList.add("btn-ready");
      }, 800);
    }

    feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function onNext(session, root) {
    if (session.isLast || (session.mode === "mistakes" && session.index >= session.total)) {
      finishTraining(session);
      return;
    }
    session.advance();
    renderQuestion(session, root);
  }

  function finishTraining(session) {
    clearAuto();
    const result = session.finish();
    if (!result) return; // уже завершена

    const beforeXp = Stats.get().xp;
    Stats.recordTraining(result);
    const stats = Stats.get();

    const fromLevel = levelInfo(beforeXp).level;
    const toLevel = levelInfo(stats.xp).level;
    renderResult(result, stats, {
      leveledUp: toLevel > fromLevel,
      toLevel: toLevel,
    });
  }

  /* ================= Экран результата ================= */

  function renderResult(result, stats, meta) {
    if (result.mode === "infinite") {
      renderInfiniteResult(result, stats, meta);
    } else {
      renderClassicResult(result, stats, meta);
    }
  }

  function commonResultParts(result, stats, meta) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    const isRecord = stats.bestTime != null && Math.abs(stats.bestTime - result.avgTime) < 0.0001;
    const info = levelInfo(stats.xp);
    const category = result.category;
    const difficulty = result.difficulty;

    const levelUpBanner = meta && meta.leveledUp
      ? h("div", { class: "levelup", role: "status" },
          h("div", { class: "levelup-emoji", text: "🎉" }),
          h("div", { class: "levelup-title", text: "Новый уровень!" }),
          h("div", { class: "levelup-level", text: `Уровень ${meta.toLevel}` }),
          h("div", { class: "levelup-sub", text: "Так держать — продолжай тренироваться!" }),
        )
      : null;

    const xpRow = h("div", { class: "result-xp" },
      h("div", { class: "result-xp-label", text: "Получено за тренировку" }),
      h("div", { class: "result-xp-value" },
        h("span", { class: "result-xp-emoji", text: "⭐" }),
        h("span", { class: "result-xp-count", text: "+0" }),
        h("span", { class: "result-xp-unit", text: "XP" }),
      ),
    );

    const levelCaption = info.isMax
      ? "Максимальный уровень достигнут 🏆"
      : `До уровня ${info.level + 1}: ${info.toNext} XP`;
    const levelBlock = h("div", { class: "result-level" },
      h("div", { class: "result-level-title", text: `🌍 Уровень ${info.level}` }),
      levelBar(info.progress * 100),
      h("div", { class: "result-level-cap", text: levelCaption }),
    );

    return {
      pct: pct,
      info: info,
      category: category,
      difficulty: difficulty,
      levelUpBanner: levelUpBanner,
      xpRow: xpRow,
      levelBlock: levelBlock,
      isRecord: isRecord,
    };
  }

  function renderClassicResult(result, stats, meta) {
    const parts = commonResultParts(result, stats, meta);
    const isMistakes = result.isMistakes;

    const statRow = (emoji, label, value, extra) =>
      h("div", { class: "result-stat" },
        h("span", { class: "result-stat-emoji", text: emoji }),
        h("span", { class: "result-stat-label", text: label }),
        h("span", { class: "result-stat-value", text: String(value) }),
        extra || null,
      );

    const modeLine = isMistakes
      ? "🧠 Мои ошибки · Повторение"
      : catDiffLabel(parts.category, parts.difficulty, true);

    const card = h("div", { class: "result-card card" },
      h("div", { class: "result-emoji", text: "🎉" }),
      h("h1", { class: "result-title", text: "Тренировка завершена!" }),
      h("div", { class: "result-mode", text: modeLine }),
      h("div", { class: "result-score", text: "0 / 0" }),
      h("div", { class: "result-accuracy", text: `${parts.pct}% точности` }),
      parts.levelUpBanner,
      parts.xpRow,
      parts.levelBlock,
      h("div", { class: "result-stats" },
        statRow("🎯", "Правильных", result.correct),
        statRow("❌", "Ошибок", result.wrong),
        statRow("🔥", "Лучшая серия", result.maxStreak),
        statRow("⏱", "Среднее время", Dom.fmtTime(result.avgTime)),
        statRow("🏆", "Лучшее среднее", Dom.fmtTime(stats.bestTime),
          parts.isRecord ? h("span", { class: "result-stat-record", text: "новый рекорд!" }) : null),
      ),
      h("div", { class: "result-actions" },
        h("button", {
          class: "btn btn-primary",
          onclick: isMistakes
            ? () => renderTraining(null, null, { mistakes: true })
            : () => renderTraining(parts.category, parts.difficulty, { mode: "classic", count: result.total }),
        }, isMistakes ? "Повторить ошибки" : "Повторить тренировку"),
        h("button", { class: "btn btn-ghost", onclick: renderHome }, "На главную"),
      ),
    );

    mount(h("div", { class: "screen screen-result" }, card));

    const scoreEl = card.querySelector(".result-score");
    const xpCountEl = card.querySelector(".result-xp-count");
    animateNumber(scoreEl, result.correct, ` / ${result.total}`, 700);
    animateNumber(xpCountEl, result.xpEarned, "", 900, "+");
  }

  function renderInfiniteResult(result, stats, meta) {
    const parts = commonResultParts(result, stats, meta);

    const statRow = (emoji, label, value, extra) =>
      h("div", { class: "result-stat" },
        h("span", { class: "result-stat-emoji", text: emoji }),
        h("span", { class: "result-stat-label", text: label }),
        h("span", { class: "result-stat-value", text: String(value) }),
        extra || null,
      );

    const modeLine = `♾️ Бесконечный · ${catDiffLabel(parts.category, parts.difficulty, true)}`;

    const card = h("div", { class: "result-card card" },
      h("div", { class: "result-emoji", text: "🎉" }),
      h("h1", { class: "result-title", text: "Тренировка завершена" }),
      h("div", { class: "result-mode", text: modeLine }),
      h("div", { class: "result-score", text: "0 вопросов" }),
      h("div", { class: "result-accuracy", text: `${parts.pct}% точности` }),
      parts.levelUpBanner,
      parts.xpRow,
      parts.levelBlock,
      h("div", { class: "result-stats" },
        statRow("✅", "Правильных", result.correct),
        statRow("❌", "Ошибок", result.wrong),
        statRow("🎯", "Точность", `${parts.pct}%`),
        statRow("🔥", "Максимальная серия", result.maxStreak),
        statRow("⏱", "Среднее время", Dom.fmtTime(result.avgTime)),
        statRow("🏆", "Лучшее среднее", Dom.fmtTime(stats.bestTime),
          parts.isRecord ? h("span", { class: "result-stat-record", text: "новый рекорд!" }) : null),
      ),
      h("div", { class: "result-actions" },
        h("button", {
          class: "btn btn-primary",
          onclick: () => renderTraining(parts.category, parts.difficulty, { mode: "infinite" }),
        }, "Продолжить тренировку"),
        h("button", { class: "btn btn-ghost", onclick: renderHome }, "В меню"),
      ),
    );

    mount(h("div", { class: "screen screen-result" }, card));

    const scoreEl = card.querySelector(".result-score");
    const xpCountEl = card.querySelector(".result-xp-count");
    const suffix = ` ${Dom.plural(result.total, "вопрос", "вопроса", "вопросов")}`;
    animateNumber(scoreEl, result.total, suffix, 700);
    animateNumber(xpCountEl, result.xpEarned, "", 900, "+");
  }

  function animateNumber(el, target, suffix, duration, prefix) {
    const start = performance.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${prefix || ""}${Math.round(target * eased)}${suffix}`;
      if (t >= 1) clearInterval(timer);
    }, 16);
  }

  /* ================= Экран «Статистика» ================= */

  function renderStats() {
    const stats = Stats.get();
    const accuracy = Stats.accuracy();
    const info = levelInfo(stats.xp);

    const top = h("div", { class: "screen-top" },
      h("button", { class: "btn btn-back", onclick: renderHome },
        h("span", { class: "back-arrow", text: "←" }),
        h("span", { text: "На главную" }),
      ),
    );

    const title = h("h1", { class: "page-title", text: "📊 Статистика" });

    // — Общие результаты —
    const totals = [
      ["🧠", "Всего вопросов", stats.totalQuestions],
      ["✅", "Правильных ответов", stats.correct],
      ["❌", "Неправильных ответов", stats.wrong],
      ["🎯", "Общая точность", `${accuracy}%`],
      ["⏱", "Среднее время ответа", stats.avgTime == null ? "—" : Dom.fmtTime(stats.avgTime)],
      ["🏆", "Лучшее время ответа", stats.bestTime == null ? "—" : Dom.fmtTime(stats.bestTime)],
      ["🔥", "Максимальная серия ответов", stats.maxStreak],
      ["🎮", "Тренировок пройдено", stats.trainingsCount],
      ["⭐", "Всего заработано XP", stats.xp],
      ["🌍", "Текущий уровень", info.level],
    ];

    const totalsSection = h("section", { class: "stats-section" },
      h("h2", { class: "section-title", text: "Общие результаты" }),
      h("div", { class: "detail-list" },
        totals.map(([emoji, label, value]) =>
          h("div", { class: "result-stat" },
            h("span", { class: "result-stat-emoji", text: emoji }),
            h("span", { class: "result-stat-label", text: label }),
            h("span", { class: "result-stat-value", text: String(value) }),
          ),
        ),
      ),
    );

    // — Результаты по сложности —
    const diffRows = Difficulties.map((d) => {
      const g = Stats.groupInfo(stats.difficultyStats, d.id);
      const s = groupSummary(g, false);
      return h("div", { class: "group-item" },
        h("span", { class: "group-emoji", text: d.emoji }),
        h("span", { class: "group-name", text: d.title }),
        h("div", { class: "group-val" },
          h("span", { class: "group-acc", text: s.acc }),
          h("span", { class: "group-more", text: s.more }),
        ),
      );
    });

    const diffSection = h("section", { class: "stats-section" },
      h("h2", { class: "section-title", text: "По сложности" }),
      h("div", { class: "group-list card" }, diffRows),
    );

    // — Результаты по категориям —
    const availableCats = Categories.filter((c) => !c.locked);
    const catRows = availableCats.map((c) => {
      const g = Stats.groupInfo(stats.categoryStats, c.id);
      const s = groupSummary(g, true);
      return h("div", { class: "group-item" },
        h("span", { class: "group-emoji", text: c.emoji }),
        h("span", { class: "group-name", text: c.title }),
        h("div", { class: "group-val" },
          h("span", { class: "group-acc", text: s.acc }),
          h("span", { class: "group-more", text: s.more }),
        ),
      );
    });

    const catSection = h("section", { class: "stats-section" },
      h("h2", { class: "section-title", text: "По категориям" }),
      h("div", { class: "group-list card" }, catRows),
    );

    // — История тренировок —
    const recent = stats.history.slice().reverse().slice(0, 15);

    const historySection = h("section", { class: "stats-section" },
      h("h2", { class: "section-title", text: "История тренировок" }),
      recent.length === 0
        ? h("div", { class: "card empty-card" },
            "Здесь появится история завершённых тренировок. Пройди первую тренировку! 🚀")
        : h("div", { class: "history-list" },
            recent.map((item) => {
              const pct = Math.round((item.correct / item.total) * 100);
              const clock = item.ts ? Dom.fmtClock(item.ts) : "";
              const dateLabel = clock ? `${Dom.fmtDate(item.date)}, ${clock}` : Dom.fmtDate(item.date);
              let subLabel;
              if (item.mode === "mistakes") {
                subLabel = "🧠 Мои ошибки · Повторение";
              } else {
                const subCat = catOf(item.category) || catOf("capitals");
                const subDiff = item.difficulty ? diffOf(item.difficulty) : null;
                subLabel = catDiffLabel(subCat, subDiff, true);
                if (item.mode === "infinite") subLabel += " · ♾️";
              }
              return h("div", { class: "history-item" },
                h("div", { class: "history-left" },
                  h("div", { class: "history-date", text: dateLabel }),
                  h("div", { class: "history-sub", text: subLabel }),
                ),
                h("div", { class: "history-main" },
                  h("span", { class: "history-score", text: `${item.correct} / ${item.total}` }),
                  h("span", {
                    class: "history-meta",
                    text: `${pct}% · ⏱ ${Dom.fmtTime(item.avgTime)} · +${item.xpEarned} XP`,
                  }),
                ),
              );
            }),
          ),
    );

    // — Мои ошибки —
    const mistakes = stats.mistakes;
    const mistakesSection = h("section", { class: "stats-section" },
      h("h2", { class: "section-title", text: "🧠 Мои ошибки" }),
      mistakes.length === 0
        ? h("div", { class: "card empty-card" }, "Пока нет ошибок — отличная работа! 🎉")
        : h("div", { class: "mistakes-wrap" },
            h("button", {
              class: "btn btn-primary btn-repeat",
              onclick: () => renderTraining(null, null, { mistakes: true }),
            },
              h("span", { text: `🔁 Повторить ошибки (${Math.min(10, mistakes.length)})` }),
            ),
            h("div", { class: "mistake-list" },
              mistakes.map((m) =>
                h("div", { class: "mistake-item" },
                  h("span", { class: "mistake-flag" },
                    FlagImage({ country: m.country, alt: `Флаг: ${m.country}`, variant: "option" }),
                  ),
                  h("div", { class: "mistake-body" },
                    h("div", { class: "mistake-q", text: m.promptText }),
                    h("div", { class: "mistake-ans", text: `Правильный ответ: ${m.correctLabel}` }),
                    h("div", { class: "mistake-wrong", text: `Ваш ответ: ${m.wrongAnswer}` }),
                  ),
                ),
              ),
            ),
          ),
    );

    mount(h("div", { class: "screen screen-stats" },
      top, title, totalsSection, diffSection, catSection, historySection, mistakesSection));
  }

  window.GeoMind.Screens = {
    renderHome,
    renderSetup,
    renderTraining,
    renderResult,
    renderStats,
  };
})();
