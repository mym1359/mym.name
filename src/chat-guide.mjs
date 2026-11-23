// Grounding notes provided to the consultation model.
const topics = [
  {
    id: "support",
    en: "Start with the questions that repeatedly reach your support team. Give the assistant approved help articles, require a source for each answer and route unresolved cases to a person. Compare the time to resolution and the number of wrong answers with your current process.",
    fa: "از سؤال‌هایی شروع کنید که تیم پشتیبانی بارها پاسخ می‌دهد. راهنمای تأییدشده را در اختیار دستیار بگذارید، برای هر پاسخ منبع بخواهید و موارد حل‌نشده را به کارشناس بسپارید. زمان حل درخواست و تعداد پاسخ‌های اشتباه را با روش فعلی مقایسه کنید.",
  },
  {
    id: "inventory",
    en: "Pilot demand forecasting on one product group. Line up sales, stockouts and promotions by date. Compare a model with a simple seasonal baseline on later weeks. Track the cost of shortages and excess stock before changing any orders.",
    fa: "پیش‌بینی تقاضا را روی یک گروه کالا آزمایش کنید. فروش، روزهای اتمام موجودی و تخفیف‌ها را برحسب تاریخ کنار هم بگذارید. مدل را روی هفته‌های بعد با یک پیش‌بینی سادهٔ فصلی بسنجید. پیش از تغییر سفارش‌ها، هزینهٔ کمبود و مازاد موجودی را مقایسه کنید.",
  },
  {
    id: "knowledge",
    en: "Choose one collection of current, approved documents. Keep the original access permissions, show the source passage and let the assistant say when evidence is missing. Test it on real staff questions, including some the documents cannot answer.",
    fa: "یک مجموعه سند به‌روز و تأییدشده انتخاب کنید. سطح دسترسی هر سند را حفظ کنید و از دستیار بخواهید بخش مرتبط را نشان دهد. آن را با سؤال‌های واقعی کارکنان، از جمله سؤال‌هایی که پاسخی در اسناد ندارند، بسنجید.",
  },
  {
    id: "documents",
    en: "For document entry, start with one recurring form. Compare extracted fields with entries checked by staff, field by field. Send uncertain values for review, and keep a human approval step before posting a payment or changing a customer record.",
    fa: "برای ورود اطلاعات، یک فرم پرتکرار را انتخاب کنید. مقدار استخراج‌شدهٔ هر فیلد را با نمونه‌های بررسی‌شده به دست کارکنان مقایسه کنید. مقادیر نامطمئن را برای بازبینی بفرستید و ثبت پرداخت یا تغییر پروندهٔ مشتری را به تأیید انسان بسپارید.",
  },
  {
    id: "sales",
    en: "Pick one sales task, such as drafting follow-up messages from approved product information. Have staff check the drafts before sending. Compare editing time, response rates and factual errors with a similar group using your current process.",
    fa: "یک کار فروش را انتخاب کنید؛ مثلاً تهیهٔ پیش‌نویس پیام پیگیری بر پایهٔ اطلاعات تأییدشدهٔ محصول. کارکنان پیش از ارسال، متن را بررسی کنند. زمان ویرایش، نرخ پاسخ و خطاهای محتوایی را با گروه مشابهی که به روش فعلی کار می‌کند بسنجید.",
  },
  {
    id: "privacy",
    en: "List the fields the pilot actually needs. Remove identifiers from test examples and check what the provider retains. Limit document access by role and test those permissions before staff enter live customer data.",
    fa: "فیلدهایی را که پایلوت واقعاً لازم دارد مشخص کنید. شناسه‌های شخصی را از نمونه‌های آزمایشی بردارید و بررسی کنید سرویس‌دهنده چه داده‌ای نگه می‌دارد. پیش از استفاده از دادهٔ واقعی مشتری، دسترسی هر نقش به اسناد را آزمایش کنید.",
  },
  {
    id: "roi",
    en: "Record monthly task volume and minutes per task before the pilot. Multiply time actually saved by the hourly cost, then subtract software, review, training and maintenance costs. Track errors alongside savings and revisit the estimate with pilot data.",
    fa: "حجم ماهانهٔ کار و زمان هر مورد را پیش از پایلوت ثبت کنید. زمان واقعاً آزادشده را در هزینهٔ ساعتی ضرب کنید و هزینهٔ ابزار، بازبینی، آموزش و نگهداری را کم کنید. خطاها را هم کنار صرفه‌جویی ثبت کنید و برآورد را با دادهٔ پایلوت بازبینی کنید.",
  },
  {
    id: "quality",
    en: "Keep a test set separate from the examples used to design the workflow. Include common cases, exceptions and questions with no reliable answer. Compare it with the current process on errors, review time and the cost of a wrong decision.",
    fa: "نمونه‌های آزمون را از نمونه‌های طراحی جدا نگه دارید. موارد رایج، استثناها و سؤال‌های بدون پاسخ معتبر را بگنجانید. خطا، زمان بازبینی و هزینهٔ تصمیم اشتباه را با فرایند فعلی مقایسه کنید.",
  },
  {
    id: "readiness",
    en: "Start with examples of the input and the correct outcome from one workflow. Check who owns them, how often fields are missing and whether unusual cases are represented. Keep a separate set for testing. A document assistant may need current manuals rather than historical labels.",
    fa: "از یک فرایند مشخص، نمونهٔ ورودی و خروجی درست جمع کنید. مسئول داده، فیلدهای خالی و پوشش موارد استثنایی را بررسی کنید. بخشی از نمونه‌ها را برای آزمون کنار بگذارید. دستیار اسناد ممکن است فقط به راهنمای به‌روز نیاز داشته باشد.",
  },
  {
    id: "adoption",
    en: "Invite staff who do the task to help design the pilot. Practice on real but anonymized examples. Teach them how to check an answer, correct it and escalate it. Use their feedback and the error log to decide when the workflow is ready for wider use.",
    fa: "کارکنانی را که این کار را انجام می‌دهند در طراحی پایلوت شریک کنید. با مثال‌های واقعی و بدون مشخصات افراد تمرین کنید. روش بررسی، اصلاح و ارجاع پاسخ را آموزش دهید و برای توسعهٔ پایلوت از بازخورد کارکنان و گزارش خطاها استفاده کنید.",
  },
  {
    id: "pilot",
    en: "Choose one repetitive task with a clear owner and examples of good output. Measure how long it takes today. Run a small pilot alongside the existing process, agree on a success threshold and keep someone responsible for reviewing mistakes.",
    fa: "یک کار تکراری با مسئول مشخص و نمونهٔ خروجی مطلوب انتخاب کنید. زمان فعلی آن را اندازه بگیرید. یک پایلوت کوچک در کنار روش فعلی اجرا کنید، از پیش معیار موفقیت بگذارید و مسئول بازبینی خطاها را مشخص کنید.",
  },
];

export const consultingGuide = topics.map((t) => t.en).join("\n");
