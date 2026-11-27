export const initiativeRoute = "work/initiative";
export const mortgageProjectRoute = initiativeRoute + "/mortgage-repayment-review";

const github = "https://github.com/mym1359/";
const repository = github + "mortgage-repayment-review";
const report = (name) => repository + "/blob/main/docs/research/" + name + ".md";
const preview = repository + "/blob/v0.1.0/docs/evaluation/";
const link = (url, en, fa) => ({ url, en, fa });

const sources = {
  cfpb: link("https://files.consumerfinance.gov/f/documents/cfpb_2025-cr-annual-report_2026-03.pdf#page=41", "CFPB mortgage complaint report", "گزارش شکایت‌های وام مسکن CFPB"),
  treasury: link("https://home.treasury.gov/system/files/256/129_HAMP_Modification_Performance_Summary_Mar2023_v1.0.pdf", "U.S. Treasury benchmark", "جدول مرجع خزانه‌داری آمریکا"),
  reconstruction: link(report("hamp-historical-reconstruction"), "Reconstruction and cohort tables", "روش بازسازی و جدول گروه‌ها"),
  quality: link(report("hamp-data-quality"), "Archive quality and provenance", "کیفیت و منشأ آرشیو"),
  coverage: link(report("hamp-monthly-evaluation-coverage"), "Monthly coverage and split calendar", "پوشش ماهانه و تقویم تفکیک"),
  asOf: link(report("hamp-asof-protocol"), "Time-aware evaluation protocol", "پروتکل ارزیابی زمان‌دار"),
  sample: link(report("hamp-sample-review"), "Authorized sample review tool", "ابزار بررسی نمونهٔ مجاز"),
  status: link(report("hamp-research-status"), "Research status and evidence gaps", "وضعیت پژوهش و شکاف شواهد"),
  release: link(repository + "/releases/tag/v0.1.0", "Download the offline demo · v0.1.0", "دریافت دموی آفلاین · نسخهٔ ۰٫۱٫۰"),
  prototype: link(repository + "/raw/3ecb10ae2d215db66870285020bb41eadf0e4b4c/demo/prototype-acs-002-decision.html", "Download the Persian decision walkthrough", "دریافت نمونهٔ تعاملی فارسی منطق تصمیم"),
  browserRun: link(repository + "/actions/runs/45979197835", "Direct-file Chromium test", "آزمون اجرای مستقیم فایل در Chromium"),
  protocol: link(preview + "protocol.md", "Independent reviewer protocol", "پروتکل ارزیابی مستقل"),
  materials: link(preview + "case-materials.md", "Synthetic cases and scoring worksheet", "پرونده‌های ساختگی و فرم امتیازدهی"),
  specification: link(repository + "/blob/main/.scratch/mortgage-repayment-review/spec.md", "Bilingual project specification", "مشخصات دوزبانهٔ پروژه"),
  tracker: link(repository + "/tree/main/.scratch/mortgage-repayment-review/issues", "Project tickets and acceptance criteria", "تسک‌ها و معیارهای پذیرش"),
  brief: link(preview + "project-brief.md", "Bilingual project brief", "خلاصهٔ دوزبانهٔ پروژه"),
  pdf: link("https://raw.githubusercontent.com/mym1359/mortgage-repayment-review/0ea7223/docs/evaluation/project-brief-en.pdf", "One-page English brief (PDF)", "خلاصهٔ انگلیسی یک‌صفحه‌ای (PDF)"),
  code: link(repository, "Source code and research reports", "کد منبع و گزارش‌های پژوهشی"),
};

export const projectResources = [sources.release, sources.pdf, sources.protocol, sources.code];

export const relatedRepositories = [
  link(github + "darj", "Darj", "درج"),
  link(github + "darj-smart-collection", "Darj Smart Collection prototype", "نمونهٔ درج برای پیگیری مطالبات"),
  link(github + "sepam", "Sepam", "سپام"),
  link(github + "credit-risk-ai", "Credit Risk AI", "نمونهٔ ریسک اعتباری"),
  link(github + "AltCreditScoreAI", "AltCreditScoreAI", "نمونهٔ امتیازدهی جایگزین"),
  link(github + "banking_credit_scoring", "Banking credit scoring", "نمونهٔ امتیازدهی بانکی"),
];

export const mortgageProject = {
  en: {
    title: "Evidence-based U.S. mortgage repayment review",
    summary: "A reproducible study of historical HAMP delinquency rates and an offline demo that helps a reviewer trace a decision to dated evidence.",
    articleLink: "Read the project article",
    resourceTitle: "Project resources",
    relatedTitle: "Earlier banking and credit-model projects",
    relatedSummary: "Darj and Sepam informed the focus on staff workflows and human review. The separate scoring repositories document model-building exercises and the limits of their evidence.",
    imageAlt: "The synthetic ACS-002 case showing agreement version 2 and the confirmed June installment after a reviewer saved a decision.",
    caption: "The offline demo after a reviewer resolved the synthetic ACS-002 agreement conflict using DOC-01.",
    findings: [
      ["29 of 30", "Historical rate estimates within 0.20 percentage points of Treasury’s figures"],
      ["102", "Monthly cohorts checked for evaluation coverage"],
      ["23", "Automated rule and research tests passed, plus a separate direct-file browser test"],
    ],
    sections: [
      {
        title: "What a reviewer needs to establish",
        paragraphs: [
          "After a loan modification, a reviewer must be able to tell which agreement applied, what the last fully applied installment was, and why a case needs further review. A payment’s due date and posting date can differ, a reversal can change the outcome, and later paperwork can resolve a conflict without changing what was knowable on an earlier date.",
          "The CFPB’s 2025 consumer response report identified trouble during the payment process as the most common category of mortgage complaint. That public record motivates the choice of problem. The project studies a way to make a review traceable from its conclusion back to the evidence available at the time.",
        ],
        links: [sources.cfpb],
      },
      {
        title: "Reconstructing the historical HAMP rates",
        paragraphs: [
          "The research began with Treasury’s published aggregates, then recovered the 2009–2017 payment archive and the monthly update covering January 2018 through July 2020. The recovery checked archived payload digests and scanned the CSV inputs. The analysis joined dated payment activity to modification records by loan, modification and target month. It separated payoffs, withdrawals and cases without valid payment evidence when building the denominator.",
          "Across 15 annual cohorts, 29 of the 30 estimates at months six and twelve were within 0.20 percentage points of Treasury’s March 2023 table. The mean absolute difference was 0.0676 percentage points. The remaining comparison, Tier 2 at month twelve in 2017, was 16.4908% versus Treasury’s 16.7%. The report preserves the difference and the inputs needed to reproduce it.",
        ],
        links: [sources.reconstruction, sources.quality, sources.treasury],
      },
      {
        title: "Testing what was knowable at the time",
        paragraphs: [
          "A retrospective match can use records assembled after the event. A prospective model requires proof that the exact version of the month-six report was available before its cutoff, and that the outcome label was available before the next evaluation partition began. The archive review, including recovered snapshots from earlier years, did not establish both timestamps for the same modification. The coverage audit inspected 102 monthly cohorts and revised the boundary between training and validation to account for label timing.",
          "I prepared a private sample-review tool that checks report versions and their predecessors, month-six active status, and outcome evidence. It sends eligible records through the existing metadata validator and reports aggregate gaps or violations. Synthetic inputs verified that path. A loan-level comparison between a simple baseline and a discrete-time model still depends on an authorized sample and adequate coverage.",
        ],
        links: [sources.coverage, sources.asOf, sources.sample, sources.status],
      },
      {
        title: "Turning the evidence into a reviewer workflow",
        paragraphs: [
          "The offline demo uses two synthetic cases. In ACS-001, a June payment reversal leaves May as the last confirmed installment and flags the case for human review. In ACS-002, two signed versions disagree. On June 13, the conflict is open and the June installment is pending. On June 17, the reviewer can inspect DOC-01, which supports version 2. June is confirmed at $1,350 only after the reviewer records the decision. A revision keeps the original entry and its evidence reference.",
          "A separate interactive prototype explored those decision states. The evaluation preview packages the offline demo, and 23 automated tests cover the review rules and research validation. A separate Chromium test opened the demo over file:// in GitHub Actions, saved a decision and revision, closed the browser, and reopened the same path. It verified the restored entries and confirmed that the June 13 view still showed May.",
        ],
        links: [sources.release, sources.prototype, sources.browserRun],
      },
      {
        title: "Preparing an independent comparison",
        paragraphs: [
          "The evaluation package uses two synthetic case packets and rotates the order across reviewers. It compares manual review with the demo and records completion time, correct findings and whether a second reader can trace the decision to the supporting records. The worksheet uses the same criteria for both methods.",
          "Independent practitioner results and a U.S. institutional pilot are pending. Any pilot would require an institution’s agreement on the scope, authorized inputs, the comparison method and success criteria. The completed work establishes a reproducible historical analysis and a working reviewer demo with tested behavior.",
        ],
        links: [sources.protocol, sources.materials, sources.brief, sources.specification, sources.tracker],
      },
    ],
  },
  fa: {
    title: "بازبینی مستند بازپرداخت وام مسکن آمریکا",
    summary: "پژوهش بازتولیدپذیر دربارهٔ نرخ‌های تاریخی تأخیر در برنامهٔ هامپ و دموی آفلاینی که کارشناس را از نتیجهٔ پرونده به شواهد همان تاریخ می‌رساند.",
    articleLink: "مطالعهٔ مقالهٔ پروژه",
    resourceTitle: "منابع پروژه",
    relatedTitle: "کارهای پیشین در بانکداری و مدل‌سازی اعتباری",
    relatedSummary: "تجربهٔ درج و سپام به تمرکز بر گردش کار کارکنان و بازبینی انسانی کمک کرد. مخزن‌های امتیازدهی، تمرین‌های مدل‌سازی و محدودهٔ شواهد آن‌ها را مستند می‌کنند.",
    imageAlt: "نمای پروندهٔ ساختگی ACS-002 پس از ثبت تصمیم کارشناس، با توافق نسخهٔ دوم و قسط تأییدشدهٔ ژوئن.",
    caption: "نمای دموی آفلاین پس از حل تعارض پروندهٔ ساختگی ACS-002 با استناد به سند DOC-01.",
    findings: [
      ["۲۹ از ۳۰", "برآورد نرخ تاریخی با اختلاف حداکثر ۰٫۲۰ واحد درصد از ارقام خزانه‌داری"],
      ["۱۰۲", "گروه ماهانه بررسی‌شده برای سنجش پوشش ارزیابی"],
      ["۲۳", "آزمون خودکار موفق برای قواعد و پژوهش، همراه با آزمون جداگانهٔ اجرای مستقیم فایل"],
    ],
    sections: [
      {
        title: "کارشناس چه چیزی باید احراز کند؟",
        paragraphs: [
          "پس از اصلاح شرایط وام، کارشناس باید بتواند مشخص کند کدام توافق در تاریخ بازبینی معتبر بوده، آخرین قسط کاملِ اعمال‌شده کدام است و چرا پرونده به بررسی بیشتر نیاز دارد. سررسید قسط و تاریخ ثبت پرداخت ممکن است متفاوت باشند. برگشت پرداخت می‌تواند نتیجه را تغییر دهد و سند دیرتر می‌تواند تعارضی را حل کند، بی‌آنکه دانسته‌های تاریخ پیشین را عوض کند.",
          "در گزارش پاسخ‌گویی به مصرف‌کنندگانِ CFPB برای سال ۲۰۲۵، مشکلات فرایند پرداخت رایج‌ترین دستهٔ شکایت‌های مرتبط با وام مسکن بود. این گزارش زمینهٔ انتخاب مسئله را روشن می‌کند. طرح بررسی می‌کند که چگونه می‌توان از نتیجهٔ پرونده به شواهد موجود در زمان تصمیم رسید.",
        ],
        links: [sources.cfpb],
      },
      {
        title: "بازسازی نرخ‌های تاریخی هامپ",
        paragraphs: [
          "پژوهش را با ارقام تجمیعی خزانه‌داری آمریکا آغاز کردم. سپس آرشیو پرداخت‌های ۲۰۰۹ تا ۲۰۱۷ و به‌روزرسانی ماهانهٔ ژانویهٔ ۲۰۱۸ تا ژوئیهٔ ۲۰۲۰ را بازیابی کردم. در این فرایند چکیدهٔ فایل‌های بایگانی‌شده بررسی شد و فایل‌های ورودی کامل خوانده شدند. تحلیل، فعالیت پرداخت را بر اساس شناسهٔ وام، شناسهٔ اصلاح و ماه هدف به سوابق اصلاح وام وصل کرد. تسویه، انصراف و نبود شاهد معتبر پرداخت هنگام تعیین مخرج جداگانه بررسی شدند.",
          "در ۱۵ گروه سالانه، ۲۹ مورد از ۳۰ برآورد ماه‌های ششم و دوازدهم حداکثر ۰٫۲۰ واحد درصد با جدول مارس ۲۰۲۳ خزانه‌داری اختلاف داشت. میانگین قدرمطلق اختلاف ۰٫۰۶۷۶ واحد درصد بود. در مورد باقی‌مانده، یعنی ماه دوازدهم گروه دوم در سال ۲۰۱۷، نرخ بازسازی‌شده ۱۶٫۴۹۰۸ درصد و نرخ رسمی ۱۶٫۷ درصد بود. اختلاف و ورودی‌های لازم برای بازتولید در گزارش ثبت شده‌اند.",
        ],
        links: [sources.reconstruction, sources.quality, sources.treasury],
      },
      {
        title: "چه اطلاعاتی در زمان تصمیم قابل دسترسی بود؟",
        paragraphs: [
          "بازسازی تاریخی می‌تواند از سوابقی استفاده کند که پس از وقوع رویداد گردآوری شده‌اند. برای ارزیابی مدل آینده‌نگر باید احراز شود که نسخهٔ مشخص گزارش ماه ششم پیش از برش و برچسب پیامد پیش از شروع بخش زمانی بعدی در دسترس بوده است. بررسی آرشیوها، از جمله نسخه‌های بازیابی‌شده از سال‌های پیشین، هر دو زمان را برای یک اصلاح وام اثبات نکرد. در بررسی پوشش، ۱۰۲ گروه ماهانه بررسی شدند و مرز آموزش و اعتبارسنجی با توجه به زمان دسترسی به برچسب‌ها اصلاح شد.",
          "برای بررسی نمونهٔ مجاز، ابزاری آماده کردم که نسخه‌های گزارش و نسخه‌های پیشین، وضعیت فعال در ماه ششم و شاهد پیامد را بررسی می‌کند. رکوردهای واجد شرایط به اعتبارسنج فرادادهٔ موجود می‌رسند و ابزار کمبودها و مغایرت‌ها را به‌صورت تجمیعی گزارش می‌کند. این مسیر با ورودی ساختگی آزموده شد. مقایسهٔ یک خط پایهٔ ساده با مدل زمان‌گسسته در سطح وام به نمونهٔ مجاز و پوشش کافی وابسته است.",
        ],
        links: [sources.coverage, sources.asOf, sources.sample, sources.status],
      },
      {
        title: "از شواهد تا گردش کار بازبینی",
        paragraphs: [
          "دموی آفلاین دو پروندهٔ ساختگی دارد. در ACS-001 با برگشت پرداخت ژوئن، مه آخرین قسط تأییدشده باقی می‌ماند و پرونده برای بازبینی انسانی علامت می‌خورد. در ACS-002 دو نسخهٔ امضاشده با هم تعارض دارند. در نمای ۱۳ ژوئن تعارض باز و قسط ژوئن معلق است. در نمای ۱۷ ژوئن، کارشناس می‌تواند سند DOC-01 را بررسی کند که نسخهٔ دوم را تأیید می‌کند. قسط ژوئن به مبلغ ۱٬۳۵۰ دلار تنها پس از ثبت تصمیم کارشناس تأیید می‌شود. اصلاحیه، تصمیم اولیه و ارجاع آن به سند را در سابقه حفظ می‌کند.",
          "نمونه‌ای تعاملی نیز برای بررسی وضعیت‌های تصمیم ساخته شد. پیش‌انتشار، دموی آفلاین را در اختیار بازبین می‌گذارد و ۲۳ آزمون خودکار، قواعد دمو و اعتبارسنجی پژوهش را پوشش می‌دهند. در یک آزمون جداگانه روی GitHub Actions، فایل دمو مستقیماً با file:// در Chromium باز شد. پس از ثبت تصمیم و اصلاحیه، مرورگر بسته شد و همان مسیر دوباره باز شد. هر دو ثبت بازیابی شدند و نمای ۱۳ ژوئن همچنان مه را نشان داد.",
        ],
        links: [sources.release, sources.prototype, sources.browserRun],
      },
      {
        title: "آماده‌سازی مقایسهٔ مستقل",
        paragraphs: [
          "بستهٔ ارزیابی دو پروندهٔ ساختگی دارد و ترتیب ارائه را میان بازبین‌ها می‌چرخاند. روش دستی و دمو از نظر زمان تکمیل، درستی یافته‌ها و امکان پیگیری تصمیم تا اسناد مقایسه می‌شوند. فرم امتیازدهی برای هر دو روش یکسان است.",
          "جمع‌آوری نتایج کارشناسان مستقل و اجرای پایلوت در یک مؤسسهٔ آمریکایی هنوز در انتظار اجراست. هر پایلوت به توافق مؤسسه دربارهٔ دامنه، ورودی‌های مجاز، روش مقایسه و معیارهای موفقیت نیاز دارد. خروجی فعلی، یک تحلیل تاریخی بازتولیدپذیر و دموی بازبینی با رفتار آزموده‌شده است.",
        ],
        links: [sources.protocol, sources.materials, sources.brief, sources.specification, sources.tracker],
      },
    ],
  },
};
