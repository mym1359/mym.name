import { initiativeRoute } from "./mortgage-project.mjs";

export const installmentProjectRoute = initiativeRoute + "/installment-repayment-review";
export const installmentDemoUrl = "/demos/installment-repayment-review/";

const repository = "https://github.com/mym1359/mym.name";
const projectPath = "/main/projects/installment-repayment-review";
const docs = repository + "/blob" + projectPath + "/docs/";
const link = (url, en, fa) => ({ url, en, fa });

const sources = {
  fed: link("https://www.federalreserve.gov/consumerscommunities/shed_data.htm", "Federal Reserve household survey data", "داده‌های نظرسنجی خانوار فدرال رزرو"),
  principles: link("https://www.fdic.gov/sites/default/files/2024-03/pr20061a.pdf", "Interagency small-dollar lending principles", "راهنمای مشترک وام‌دهی خرد"),
  results: link(docs + "synthetic-results.json", "Reproducible synthetic results", "نتایج بازتولیدپذیر پرونده‌های ساختگی"),
  methodology: link(docs + "methodology.md", "Methodology and assumptions", "روش‌شناسی و فرض‌ها"),
  protocol: link(docs + "reviewer-protocol.md", "Independent reviewer protocol", "پروتکل بازبینی مستقل"),
  repository: link(repository + "/tree" + projectPath, "Source code on GitHub", "کد منبع در گیت‌هاب"),
};

export const installmentProject = {
  en: {
    title: "Installment Repayment Review",
    summary: "An interactive research prototype that compares affordable repayment options after the first missed payment on a small-dollar installment loan.",
    articleLink: "Read the project case study",
    demoLink: "Open the interactive demo",
    findings: [
      ["8 of 8", "Synthetic cases matched their expected outcomes"],
      ["4", "Repayment options compared in each case"],
      ["13", "Automated tests passed"],
    ],
    sections: [
      {
        title: "A specific servicing decision",
        paragraphs: [
          "A missed payment can reflect a mismatch between a due date and income, or a budget that cannot support the scheduled payment. The prototype shows the budget assumptions for each case. It compares a due-date change with spreading arrears over two, three, or six months and flags cases that need manual review.",
          "Federal Reserve survey data motivates the income and bill-payment scenarios. The interagency principles for small-dollar lending identify timely and reasonable assistance as part of responsible servicing.",
        ],
        links: [sources.fed, sources.principles],
      },
      {
        title: "An auditable comparison",
        paragraphs: [
          "The demo displays the peak payment, any modeled extra fee, and the reason each option fits or requires review. It exports a versioned record of the assumptions and calculations. All inputs are fictional, and the review runs in the browser.",
          "Eight hand-written cases cover timing, affordability, fees and cent rounding. Six cases have a reviewable modeled option. The cases test the rules under selected conditions. Changes to contractual interest, repayment outcomes, and operational savings would require other data.",
        ],
        links: [sources.results, sources.methodology],
      },
      {
        title: "A plan for independent evaluation",
        paragraphs: [
          "The reviewer protocol compares the tool with a manual worksheet using the same rules. It records completion time, calculation accuracy and whether a second reviewer can reconstruct the decision. A future authorized partner could measure 60-day delinquency, 90-day plan adherence, and servicing cost on real accounts.",
        ],
        links: [sources.protocol, sources.repository],
      },
    ],
  },
  fa: {
    title: "بازبینی بازپرداخت وام‌های خرد اقساطی",
    summary: "نمونهٔ تعاملی پژوهشی برای مقایسهٔ گزینه‌های قابل‌پرداخت پس از اولین قسط عقب‌افتادهٔ وام خرد.",
    articleLink: "مطالعهٔ پروژه",
    demoLink: "اجرای دموی انگلیسی",
    findings: [
      ["۸ از ۸", "پروندهٔ ساختگی با نتیجهٔ مورد انتظار"],
      ["۴", "گزینهٔ بازپرداخت برای مقایسه در هر پرونده"],
      ["۱۳", "آزمون خودکار موفق"],
    ],
    sections: [
      {
        title: "یک تصمیم مشخص در رسیدگی به اقساط",
        paragraphs: [
          "قسط عقب‌افتاده گاهی حاصل ناهماهنگی سررسید با دریافت درآمد است و گاهی از کمبود بودجه می‌آید. نمونهٔ پژوهشی فرض‌های بودجه را برای هر پرونده نشان می‌دهد، جابه‌جایی سررسید را با تقسیط مبلغ معوق در دو، سه یا شش ماه مقایسه می‌کند و موارد نیازمند بررسی کارشناس را مشخص می‌کند.",
          "سناریوهای درآمد و پرداخت از موضوعات نظرسنجی فدرال رزرو الهام گرفته‌اند. اصول مشترک وام‌دهی خرد نیز کمک به‌موقع و متناسب را از اجزای رسیدگی مسئولانه می‌داند.",
        ],
        links: [sources.fed, sources.principles],
      },
      {
        title: "مقایسه‌ای که می‌توان بازبینی کرد",
        paragraphs: [
          "دمو بیشترین مبلغ قسط، کارمزد فرضی و دلیل نتیجهٔ هر گزینه را نمایش می‌دهد و یک گزارش نسخه‌دار از فرض‌ها و محاسبات می‌سازد. ورودی‌ها ساختگی‌اند و محاسبه‌ها در مرورگر انجام می‌شوند.",
          "هشت پروندهٔ طراحی‌شده، زمان‌بندی، توان پرداخت، کارمزد و گردکردن مبلغ را پوشش می‌دهند. در شش پرونده دست‌کم یک گزینه برای بررسی وجود داشت. این نتایج رفتار قواعد را در سناریوهای انتخاب‌شده نشان می‌دهند. سنجش تغییر بهرهٔ قراردادی، نتیجهٔ بازپرداخت و صرفه‌جویی عملیاتی به داده‌های دیگری نیاز دارد.",
        ],
        links: [sources.results, sources.methodology],
      },
      {
        title: "طرح ارزیابی مستقل",
        paragraphs: [
          "پروتکل بازبینی، استفاده از ابزار را با کاربرگ دستی و قواعد یکسان مقایسه می‌کند. زمان رسیدگی، دقت محاسبات و امکان بازسازی تصمیم توسط کارشناس دوم ثبت می‌شوند. با همکاری یک مؤسسهٔ مجاز می‌توان در آینده معوق‌شدن ۶۰ روزه، پایبندی ۹۰ روزه به طرح و هزینهٔ رسیدگی را روی حساب‌های واقعی سنجید.",
        ],
        links: [sources.protocol, sources.repository],
      },
    ],
  },
};
