// Answers and follow-up questions are reviewed together in both site languages.
const topics = [
  {
    id: "support",
    match:
      /customer (support|service)|support (team|ticket)|help ?desk|پشتیبانی|خدمات مشتری|مرکز تماس/,
    en: "Start with the questions that repeatedly reach your support team. Give the assistant approved help articles, require a source for each answer and route unresolved cases to a person. Compare the time to resolution and the number of wrong answers with your current process.",
    fa: "از سؤال‌هایی شروع کنید که تیم پشتیبانی بارها پاسخ می‌دهد. راهنمای تأییدشده را در اختیار دستیار بگذارید، برای هر پاسخ منبع بخواهید و موارد حل‌نشده را به کارشناس بسپارید. زمان حل درخواست و تعداد پاسخ‌های اشتباه را با روش فعلی مقایسه کنید.",
  },
  {
    id: "inventory",
    match: /inventory|stockout|demand forecast|warehouse|موجودی|تقاضا|انبار/,
    en: "Pilot demand forecasting on one product group. Line up sales, stockouts and promotions by date. Compare a model with a simple seasonal baseline on later weeks. Track the cost of shortages and excess stock before changing any orders.",
    fa: "پیش‌بینی تقاضا را روی یک گروه کالا آزمایش کنید. فروش، روزهای اتمام موجودی و تخفیف‌ها را برحسب تاریخ کنار هم بگذارید. مدل را روی هفته‌های بعد با یک پیش‌بینی سادهٔ فصلی بسنجید. پیش از تغییر سفارش‌ها، هزینهٔ کمبود و مازاد موجودی را مقایسه کنید.",
  },
  {
    id: "knowledge",
    match:
      /knowledge|internal (document|manual)|document search|\brag\b|دانش|اسناد داخلی|دستورالعمل|جستجوی سند/,
    en: "Choose one collection of current, approved documents. Keep the original access permissions, show the source passage and let the assistant say when evidence is missing. Test it on real staff questions, including some the documents cannot answer.",
    fa: "یک مجموعه سند به‌روز و تأییدشده انتخاب کنید. سطح دسترسی هر سند را حفظ کنید و از دستیار بخواهید بخش مرتبط را نشان دهد. آن را با سؤال‌های واقعی کارکنان، از جمله سؤال‌هایی که پاسخی در اسناد ندارند، بسنجید.",
  },
  {
    id: "documents",
    match:
      /invoice|data entry|extract.*document|فاکتور|ورود اطلاعات|استخراج.*سند/,
    en: "For document entry, start with one recurring form. Compare extracted fields with entries checked by staff, field by field. Send uncertain values for review, and keep a human approval step before posting a payment or changing a customer record.",
    fa: "برای ورود اطلاعات، یک فرم پرتکرار را انتخاب کنید. مقدار استخراج‌شدهٔ هر فیلد را با نمونه‌های بررسی‌شده به دست کارکنان مقایسه کنید. مقادیر نامطمئن را برای بازبینی بفرستید و ثبت پرداخت یا تغییر پروندهٔ مشتری را به تأیید انسان بسپارید.",
  },
  {
    id: "sales",
    match: /marketing|sales|campaign|بازاریابی|فروش|کمپین/,
    en: "Pick one sales task, such as drafting follow-up messages from approved product information. Have staff check the drafts before sending. Compare editing time, response rates and factual errors with a similar group using your current process.",
    fa: "یک کار فروش را انتخاب کنید؛ مثلاً تهیهٔ پیش‌نویس پیام پیگیری بر پایهٔ اطلاعات تأییدشدهٔ محصول. کارکنان پیش از ارسال، متن را بررسی کنند. زمان ویرایش، نرخ پاسخ و خطاهای محتوایی را با گروه مشابهی که به روش فعلی کار می‌کند بسنجید.",
  },
  {
    id: "privacy",
    match:
      /privacy|confidential|personal data|access control|محرمان|حریم خصوصی|دسترسی|اطلاعات شخصی/,
    en: "List the fields the pilot actually needs. Remove identifiers from test examples and check what the provider retains. Limit document access by role and test those permissions before staff enter live customer data.",
    fa: "فیلدهایی را که پایلوت واقعاً لازم دارد مشخص کنید. شناسه‌های شخصی را از نمونه‌های آزمایشی بردارید و بررسی کنید سرویس‌دهنده چه داده‌ای نگه می‌دارد. پیش از استفاده از دادهٔ واقعی مشتری، دسترسی هر نقش به اسناد را آزمایش کنید.",
  },
  {
    id: "roi",
    match:
      /\broi\b|return on investment|payback|بازگشت سرمایه|صرفه جویی|توجیه اقتصادی/,
    en: "Record monthly task volume and minutes per task before the pilot. Multiply time actually saved by the hourly cost, then subtract software, review, training and maintenance costs. Track errors alongside savings and revisit the estimate with pilot data.",
    fa: "حجم ماهانهٔ کار و زمان هر مورد را پیش از پایلوت ثبت کنید. زمان واقعاً آزادشده را در هزینهٔ ساعتی ضرب کنید و هزینهٔ ابزار، بازبینی، آموزش و نگهداری را کم کنید. خطاها را هم کنار صرفه‌جویی ثبت کنید و برآورد را با دادهٔ پایلوت بازبینی کنید.",
  },
  {
    id: "quality",
    match:
      /evaluat|measur|accuracy|hallucinat|metric|ارزیابی|بسنج|دقت|توهم|شاخص|اندازه گیری/,
    en: "Keep a test set separate from the examples used to design the workflow. Include common cases, exceptions and questions with no reliable answer. Compare it with the current process on errors, review time and the cost of a wrong decision.",
    fa: "نمونه‌های آزمون را از نمونه‌های طراحی جدا نگه دارید. موارد رایج، استثناها و سؤال‌های بدون پاسخ معتبر را بگنجانید. خطا، زمان بازبینی و هزینهٔ تصمیم اشتباه را با فرایند فعلی مقایسه کنید.",
  },
  {
    id: "readiness",
    match:
      /training data|data quality|data readiness|what data|چه داده|کیفیت داده|آمادگی داده/,
    en: "Start with examples of the input and the correct outcome from one workflow. Check who owns them, how often fields are missing and whether unusual cases are represented. Keep a separate set for testing. A document assistant may need current manuals rather than historical labels.",
    fa: "از یک فرایند مشخص، نمونهٔ ورودی و خروجی درست جمع کنید. مسئول داده، فیلدهای خالی و پوشش موارد استثنایی را بررسی کنید. بخشی از نمونه‌ها را برای آزمون کنار بگذارید. دستیار اسناد ممکن است فقط به راهنمای به‌روز نیاز داشته باشد.",
  },
  {
    id: "adoption",
    match:
      /staff training|employee training|change management|آموزش کارمند|آموزش کارکنان|مدیریت تغییر/,
    en: "Invite staff who do the task to help design the pilot. Practice on real but anonymized examples. Teach them how to check an answer, correct it and escalate it. Use their feedback and the error log to decide when the workflow is ready for wider use.",
    fa: "کارکنانی را که این کار را انجام می‌دهند در طراحی پایلوت شریک کنید. با مثال‌های واقعی و بدون مشخصات افراد تمرین کنید. روش بررسی، اصلاح و ارجاع پاسخ را آموزش دهید و برای توسعهٔ پایلوت از بازخورد کارکنان و گزارش خطاها استفاده کنید.",
  },
  {
    id: "pilot",
    match:
      /start|pilot|use ai|ai (help|benefit)|use artificial intelligence|automat|use cases?|adopt|implement|شروع|پایلوت|خودکار|اتوماسیون|کاربرد|استفاده از هوش مصنوعی|پیاده سازی/,
    en: "Choose one repetitive task with a clear owner and examples of good output. Measure how long it takes today. Run a small pilot alongside the existing process, agree on a success threshold and keep someone responsible for reviewing mistakes.",
    fa: "یک کار تکراری با مسئول مشخص و نمونهٔ خروجی مطلوب انتخاب کنید. زمان فعلی آن را اندازه بگیرید. یک پایلوت کوچک در کنار روش فعلی اجرا کنید، از پیش معیار موفقیت بگذارید و مسئول بازبینی خطاها را مشخص کنید.",
  },
];
const examples = {
  support: [
    "Classify last week’s support tickets by reason. For one common reason, compare a draft response against the answer your team approved.",
    "تیکت‌های هفتهٔ گذشته را بر اساس دلیل تماس دسته‌بندی کنید. برای یک دلیل پرتکرار، پاسخ پیشنهادی دستیار را با پاسخ تأییدشدهٔ تیم بسنجید.",
  ],
  inventory: [
    "For one product, predict next week’s sales using only earlier weeks. Compare the forecast with both actual sales and last week’s sales.",
    "برای یک کالا، فروش هفتهٔ آینده را فقط با دادهٔ هفته‌های قبل پیش‌بینی کنید. نتیجه را با فروش واقعی و پیش‌بینی ساده بر پایهٔ هفتهٔ گذشته مقایسه کنید.",
  ],
  knowledge: [
    "Ask which expenses require approval. A useful answer cites the relevant policy paragraph and declines when the policy does not cover the case.",
    "بپرسید کدام هزینه‌ها به تأیید مدیر نیاز دارند. دستیار باید بند مرتبط دستورالعمل را نشان دهد و اگر مورد در سند نیامده این را اعلام کند.",
  ],
  documents: [
    "Take a batch of redacted invoices and compare extracted totals with staff-verified totals. Count the corrections before connecting an accounting system.",
    "چند فاکتور بدون مشخصات افراد انتخاب کنید. مبلغ استخراج‌شده را با مبلغ بررسی‌شده به دست کارشناس بسنجید و پیش از اتصال به حسابداری، تعداد اصلاحات را بشمارید.",
  ],
  sales: [
    "Draft two follow-up messages for a product demo from the same product sheet. Ask a salesperson to check every promise and record editing time.",
    "برای پیگیری معرفی یک محصول از روی برگهٔ مشخصاتش دو متن تهیه کنید. کارشناس فروش وعده‌های متن را بررسی کند و زمان ویرایش را ثبت کند.",
  ],
  privacy: [
    "Test with a fictional employee who can see only their team’s handbook. Ask for another team’s restricted document and check that no passage is returned.",
    "با حساب آزمایشی یک کارمند که فقط به راهنمای تیمش دسترسی دارد، سند محدود تیم دیگر را بخواهید و بررسی کنید هیچ بخشی از آن برنگردد.",
  ],
  roi: [
    "For illustration, 200 tasks per month × 3 minutes saved gives 10 hours. Value the time actually reusable, then subtract monthly operation and review costs.",
    "مثلاً ۲۰۰ کار در ماه با ۳ دقیقه صرفه‌جویی برای هر کار، مجموعاً ۱۰ ساعت می‌شود. ارزش زمان واقعاً قابل استفاده را محاسبه و هزینهٔ بهره‌برداری و بازبینی را کم کنید.",
  ],
  quality: [
    "For a support pilot, record whether each answer is correct, supported by a source and routed to a person when needed. Review the errors separately.",
    "در پایلوت پشتیبانی، درستی پاسخ، وجود منبع و ارجاع به‌موقع به کارشناس را جداگانه ثبت کنید و نمونه‌های خطادار را مرور کنید.",
  ],
  readiness: [
    "Sample one week of tickets and check for missing categories, personal identifiers and duplicate tickets before preparing evaluation examples.",
    "تیکت‌های یک هفته را نمونه‌برداری کنید و پیش از آماده‌سازی آزمون، دسته‌های خالی، اطلاعات هویتی و تیکت‌های تکراری را بررسی کنید.",
  ],
  adoption: [
    "Ask two staff members to review the same AI draft and record where their decisions differ. Use the disagreements to improve their review instructions.",
    "دو کارمند یک پیش‌نویس را بررسی کنند و اختلاف‌نظرهایشان را ثبت کنند. از این موارد برای اصلاح دستورالعمل بازبینی استفاده کنید.",
  ],
  pilot: [
    "Try drafting replies for a single support queue. Staff approve every reply. Compare handling time and errors with the previous workflow before expanding.",
    "تهیهٔ پیش‌نویس پاسخ در یک صف پشتیبانی را آزمایش کنید. هر پاسخ را کارشناس تأیید کند و پیش از گسترش، زمان رسیدگی و خطا را با روش قبلی مقایسه کنید.",
  ],
};
const outside =
  /\b(weather|recipe|football|horoscope|poem|prescri\w*|movie|capital of|diagnos\w*|election|homework|song|joke)\b|آب و هوا|هواشناسی|دستور پخت|فوتبال|شعر بگو|تکلیف مدرسه|آهنگ بساز|داروی|انتخابات|لطیفه|جوک|پایتخت|طالع بینی/;
const business =
  /\b(business|company|consult\w*|workflow|bank\w*|retail\w*|shop|store|factory|crm|erp|team|employees?|customers?|firm|enterprise|operations?|staff|small business)\b|کسب و کار|کسب ?وکار|شرکت|بانک|سازمان|فروشگاه|کارخانه|کارگاه|تیم|کارمند|کارکنان|مشاوره|مشتری|فرایند/;
const ai =
  /\b(ai|llms?|chatbots?|artificial intelligence|machine learning|gpt)\b|هوش مصنوعی|یادگیری ماشین|چت بات|چتبات|مدل زبانی/;
const bespoke =
  /\b(exact(ly)?|which crm|quote|pricing|budget|how long|how many|which vendor|guarantee|contract|compliance|license fee|sap|salesforce|cheapest|specific vendor|how much|which model|which tool)\b|قیمت|تعرفه|تضمین|مقررات|قانون|قرارداد|دقیق|چقدر|چند تومان|بودجه|چه مدت|چند روز|کدام (مدل|ابزار)|چه (مدل|ابزار)ی/;
const domainTask =
  /customer (support|service)|support ticket|customer churn|inventory|invoice|knowledge base|demand forecast|\broi\b|پشتیبانی مشتری|فاکتور|موجودی|بازگشت سرمایه|پایگاه دانش|ریزش مشتری/;
const followup =
  /^(and |what about |how (about|do (we|i) (measure|evaluate))|و |حالا |چطور (بسنج|ارزیابی)|چه شاخص|در مورد )/;
export function answerQuestion(input, lang, previous = null) {
  const q = input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200d-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const fa = lang === "fa";
  const reply = (kind, text, topic = null) => ({ kind, text, topic });
  if (/^(hello|hi|سلام|درود)[!.؟? ]*$/.test(q))
    return reply(
      "welcome",
      fa
        ? "سلام! کدام کار کسب‌وکارتان را می‌خواهید با هوش مصنوعی بهتر کنید؟"
        : "Hello! Which business workflow would you like to improve with AI?",
    );
  if (
    Object.hasOwn(examples, previous) &&
    /^(give (me |us )?(an? )?example|for example|show me an example|مثلا|مثال|یک مثال|یه مثال|نمونه)([ ؟?!.]*(بزن|بده|بگو)?[ ؟?!.]*)$/.test(
      q,
    )
  ) {
    return reply("answer", examples[previous][fa ? 1 : 0], previous);
  }
  const matches = topics.filter((t) => t.match.test(q));
  const goal = matches.find((t) =>
    ["roi", "quality", "privacy", "readiness"].includes(t.id),
  );
  const matched = goal || matches[0];
  const continuing = Boolean(
    previous &&
    (followup.test(q) ||
      (q.split(" ").length < 7 && (matched || bespoke.test(q)))),
  );
  const inScope =
    business.test(q) ||
    domainTask.test(q) ||
    (ai.test(q) && matched && matched.id !== "pilot") ||
    continuing;
  if (outside.test(q) || (!inScope && !ai.test(q)))
    return reply(
      "outside",
      fa
        ? "این موضوع خارج از تخصص من است. دربارهٔ کاربرد هوش مصنوعی در یک فرایند کسب‌وکار، مثل فروش یا پشتیبانی، چه سؤالی دارید؟"
        : "That falls outside my specialty. I can help with applying AI to business workflows such as sales or customer support.",
    );
  if (matched && inScope && !bespoke.test(q))
    return reply("answer", matched[fa ? "fa" : "en"], matched.id);
  if (
    !inScope ||
    (business.test(q) &&
      !ai.test(q) &&
      !matched &&
      !continuing &&
      !bespoke.test(q))
  )
    return reply(
      "clarify",
      fa
        ? "برای اینکه راهنمایی مرتبط بدهم، می‌خواهید هوش مصنوعی را در کدام بخش کسب‌وکارتان به کار ببرید؟"
        : "Which part of your business would you like to apply AI to?",
    );
  return reply(
    "refer",
    fa
      ? "برای این سؤال پاسخ قابل اتکایی در راهنمای من نیست. می‌توانید متن را برای محمد یداله مقدم بفرستید تا شخصاً در پنل شما پاسخ دهد."
      : "I don’t have a reliable answer for this case. You can send the question to Mohammad Yadollah Moghaddam for a personal reply in your workspace.",
  );
}

// Share the same business notes with the server-side language model.
export const consultingGuide = topics.map((topic) => topic.en).join("\n");
