const brokerageLessons = [
  {
    id: "what-is-a-broker",
    route: "start-here/brokerage-basics",
    navRoute: "start-here/brokerage-basics",
    moduleId: "brokerage-fundamentals",
    order: 1,
    title: "What does a broker actually do?",
    eyebrow: "Brokerage fundamentals · Lesson 01",
    difficulty: "Beginner",
    estimatedTime: 8,
    summary: "Understand why a broker exists, what services it provides, and which responsibilities still belong to you.",
    objectives: [
      "Define a broker without confusing it with an exchange.",
      "Identify the main services a modern broker provides.",
      "Recognize what a broker does not guarantee.",
    ],
    sections: [
      {
        type: "explanation",
        title: "A broker is your access layer",
        body: "A broker is a regulated intermediary that accepts your instructions and provides access to financial products and trading venues. It maintains the account interface, checks whether an order is allowed, handles routing and records the resulting position. The broker is the access point; it is not usually the market where buyers and sellers meet.",
      },
      {
        type: "why",
        title: "Why does the broker exist?",
        body: "Markets need consistent identity, permissions, risk checks, records, custody arrangements and settlement instructions. A broker organizes those responsibilities into an account you can operate. Without that layer, each investor would need direct relationships with venues, clearing organizations, custodians and data providers.",
      },
      {
        type: "example",
        title: "A realistic order instruction",
        body: "Suppose you submit a limit order to buy 10 shares of a stock at no more than $50. The broker validates the account and order, selects or follows a routing path, sends the order toward a venue and reports any execution. The $50 limit is your instruction; it is not a promise that a seller will trade with you.",
      },
      {
        type: "mistake",
        title: "A broker does not approve the investment idea",
        body: "Beginners sometimes interpret an accepted order as evidence that the trade is sensible. Acceptance generally means the order passed account, permission and risk checks. It does not mean the price is attractive, the security fits your goals or a profit is likely.",
      },
      {
        type: "best-practice",
        title: "Separate platform competence from trade judgment",
        body: "Before sending any order, verify the contract, action, quantity, order type, price, time in force and maximum financial exposure. Treat the broker's preview as a final technical check, not as a substitute for understanding the decision.",
      },
      {
        type: "try-it",
        title: "Explain it without jargon",
        body: "Imagine a friend says, “My broker is the stock market.” Write one sentence explaining the difference. A strong answer identifies the broker as the access and account layer, and the exchange or venue as a place where orders may interact.",
      },
    ],
  },
  {
    id: "broker-vs-exchange",
    route: "learn/broker-vs-exchange",
    navRoute: "start-here/brokerage-basics",
    moduleId: "brokerage-fundamentals",
    order: 2,
    title: "Broker, exchange and market maker",
    eyebrow: "Brokerage fundamentals · Lesson 02",
    difficulty: "Beginner",
    estimatedTime: 9,
    summary: "Distinguish the account provider, trading venue, and liquidity participant in a market transaction.",
    objectives: [
      "Distinguish a broker from an exchange or other venue.",
      "Explain how a market maker can supply liquidity.",
      "Understand why one order may interact with several venue types.",
    ],
    sections: [
      {
        type: "explanation",
        title: "Three different jobs",
        body: "The broker receives and manages your order. An exchange or other venue operates rules and systems where eligible orders can interact. A market maker is a participant that may continuously quote prices to buy and sell. One organization can have several businesses, but the roles remain conceptually different.",
      },
      {
        type: "why",
        title: "Why the distinction matters",
        body: "Order status, market data and execution reports describe different parts of the process. A broker can acknowledge an order before a venue executes it. A visible quote can come from a particular market participant or venue. Knowing the roles helps you diagnose why an accepted order is still waiting.",
      },
      {
        type: "example",
        title: "A limit order that waits",
        body: "A share is quoted at a $24.98 bid and a $25.04 ask. You place a buy limit at $25.00. The broker may accept and route the order, but the venue cannot create a seller at your price. Your order can remain active between the bid and ask until another participant agrees to sell or you change the instruction.",
      },
      {
        type: "warning",
        title: "Displayed liquidity is not guaranteed",
        body: "Quotes and displayed sizes can change before your order arrives, especially in fast or thin markets. A marketable order can receive a different result than the screen suggested. The risk grows when spreads are wide, displayed size is small or prices move quickly.",
      },
      {
        type: "best-practice",
        title: "Read status in context",
        body: "When troubleshooting, ask which layer produced the message: your broker, a routing destination, a trading venue or a post-trade process. Preserve the order details and timestamps. Precise context is more useful than assuming that “the market rejected it.”",
      },
      {
        type: "try-it",
        title: "Classify the role",
        body: "For each statement, identify the likely role: maintains your account, publishes venue rules, or posts two-sided quotes. Then explain why the same firm name appearing in more than one context does not make the underlying roles identical.",
      },
    ],
  },
  {
    id: "trade-lifecycle",
    route: "learn/trade-lifecycle",
    navRoute: "start-here/brokerage-basics",
    moduleId: "brokerage-fundamentals",
    order: 3,
    title: "From order to settlement",
    eyebrow: "Brokerage fundamentals · Lesson 03",
    difficulty: "Beginner",
    estimatedTime: 10,
    summary: "Trace the separate events between pressing Submit and owning a settled position.",
    objectives: [
      "Sequence validation, routing, execution, clearing and settlement.",
      "Distinguish an order acknowledgment from an execution.",
      "Recognize failures that can happen at different lifecycle stages.",
    ],
    sections: [
      {
        type: "explanation",
        title: "A trade is a chain of events",
        body: "Your instruction begins with account and order validation. If accepted, it can be routed to a venue. An execution occurs only when compatible interest trades. Clearing determines the obligations of the parties, and settlement completes the exchange of securities and cash according to the applicable process.",
      },
      {
        type: "important",
        title: "Accepted, filled and settled are not synonyms",
        body: "Accepted means the broker has received and allowed the instruction to proceed. Filled means some or all of the requested quantity executed. Settled means the post-trade delivery obligations completed. A position can appear in your account after execution while cash and settlement records are still progressing.",
      },
      {
        type: "example",
        title: "One order, two executions",
        body: "You place an order for 100 shares. Sixty shares execute first and forty execute later. The order is partially filled after the first execution and filled only after the second. Each execution can have its own time and price, while the platform shows an average price for the resulting position.",
      },
      {
        type: "mistake",
        title: "An open order is not a position",
        body: "A working buy order expresses an intention but does not create ownership until it executes. Forgetting an open order can create an unexpected position later if the market reaches its price. Review both the Orders area and the Portfolio area rather than assuming one view tells the entire story.",
      },
      {
        type: "best-practice",
        title: "Verify the execution report",
        body: "After an order changes state, confirm the filled quantity, average price, remaining quantity, commissions where shown and resulting position. If the result differs from your expectation, preserve the order and execution details before editing or submitting another order.",
      },
      {
        type: "try-it",
        title: "Put the lifecycle in order",
        body: "Arrange these events from earliest to latest: settlement, order validation, execution, routing and clearing. Then identify which event actually establishes the trade price. The exercise tests whether you can separate the visible button press from the later market and post-trade events.",
      },
    ],
  },
];

const ibkrFundamentalsLessons = [
  {
    id: "ibkr-overview",
    route: "start-here/ibkr-overview",
    navRoute: "start-here/ibkr-overview",
    moduleId: "interactive-brokers-fundamentals",
    order: 1,
    title: "Interactive Brokers at a glance",
    eyebrow: "Interactive Brokers fundamentals · Lesson 01",
    difficulty: "Beginner",
    estimatedTime: 11,
    verifiedOn: "2026-08-11",
    summary: "Understand what IBKR provides, how a single account connects to several platforms, and where account configuration differs from trading workflow.",
    objectives: [
      "Describe IBKR as a broker and account provider rather than a single app.",
      "Separate account capabilities from the interface used to access them.",
      "Recognize which IBKR-specific facts require current verification.",
    ],
    sections: [
      { type: "explanation", title: "One brokerage relationship, several access points", body: "Interactive Brokers provides brokerage accounts, market access, custody and reporting services, while offering several interfaces for account management and trading. Your account, permissions, balances and positions are the underlying relationship. IBKR Desktop, Client Portal, TWS and mobile applications are different ways to interact with parts of that relationship." },
      { type: "why", title: "Why the distinction matters", body: "A platform can hide, simplify or reorganize features without changing the underlying account. If a setting is not visible in the trading screen, it may belong to Client Portal account settings. If an instrument cannot be traded, changing applications usually does not create the missing permission, eligibility or buying power." },
      { type: "example", title: "The same account across a workflow", body: "A learner might review balances and statements in Client Portal, build a watchlist in IBKR Desktop and later use a mobile application to monitor a position. The interface changes, but the account position and open-order state remain account-level information. Always verify synchronization and order status rather than assuming a screen is isolated." },
      { type: "important", title: "Availability depends on the account and jurisdiction", body: "Products, account types, platforms and permissions can vary by legal residence, IBKR entity, regulatory classification and financial profile. Treat broad product lists as an overview, not a guarantee that a particular account can trade every listed market or security." },
      { type: "mistake", title: "Do not confuse market access with market data", body: "Permission to trade a product and entitlement to receive a particular real-time quote are separate. An account may be eligible to submit an order while displaying delayed data, or it may receive data for a product it is not permitted to trade. Check both states independently." },
      { type: "best-practice", title: "Use a three-layer mental model", body: "When diagnosing a problem, identify the account layer, the platform layer and the market layer. Ask whether the account permits the action, whether the chosen interface exposes the needed control and whether the market or venue is currently able to accept or execute the instruction." },
    ],
    sources: [
      { title: "IBKR Account Guide", url: "https://www.interactivebrokers.com/en/accounts/account-guide.php" },
      { title: "Why Trade Globally with IBKR?", url: "https://www.interactivebrokers.com/en/whyib/overview.php" },
    ],
  },
  {
    id: "ibkr-platform-ecosystem",
    route: "start-here/platform-ecosystem",
    navRoute: "start-here/platform-ecosystem",
    moduleId: "interactive-brokers-fundamentals",
    order: 2,
    title: "Choose the right IBKR platform",
    eyebrow: "Interactive Brokers fundamentals · Lesson 02",
    difficulty: "Beginner",
    estimatedTime: 13,
    verifiedOn: "2026-08-11",
    summary: "Compare IBKR Desktop, Client Portal, TWS, IBKR Mobile and GlobalTrader by purpose rather than assuming one interface is best for every task.",
    objectives: [
      "Match each major IBKR platform to its primary workflow.",
      "Choose simplicity or depth deliberately instead of by habit.",
      "Know when an account-management task belongs in Client Portal.",
    ],
    sections: [
      { type: "explanation", title: "Platforms are workflow choices", body: "IBKR offers multiple interfaces because a clean account overview, a mobile trade, a modern desktop workflow and a highly configurable professional workstation impose different design needs. Choose the interface that exposes the controls you understand and need; more visible controls do not automatically make a workflow safer." },
      { type: "comparison", title: "Platform comparison", body: "This comparison describes the intended learning role of each platform based on official product pages reviewed on the verification date. Features change, so confirm a specific tool before depending on it.", items: [
        { name: "IBKR Desktop", purpose: "Modern desktop trading and portfolio workflow", complexity: "Moderate", bestFor: "Learners who want approachable desktop depth" },
        { name: "Client Portal", purpose: "Web trading, reporting and account management", complexity: "Low–moderate", bestFor: "Balances, settings, statements and browser access" },
        { name: "Trader Workstation", purpose: "Highly configurable advanced trading workstation", complexity: "High", bestFor: "Experienced users needing advanced tools and order controls" },
        { name: "IBKR Mobile", purpose: "Broad mobile monitoring and trading toolkit", complexity: "Moderate", bestFor: "Fuller account access away from a desktop" },
        { name: "GlobalTrader", purpose: "Streamlined mobile-first global investing", complexity: "Low", bestFor: "Simpler discovery, monitoring and order entry" },
      ] },
      { type: "example", title: "A deliberate platform workflow", body: "A beginner can configure trading permissions in Client Portal, study a contract and submit a paper order in IBKR Desktop, then review the resulting statement in Client Portal. This separates account administration, trading practice and reporting without pretending every task must happen in one screen." },
      { type: "mistake", title: "Do not choose by feature count", body: "A platform with more order types and panels can increase error risk when those controls are not understood. Start with the interface that supports the current task clearly. Move to a deeper platform when a known requirement—not curiosity alone—justifies the added complexity." },
      { type: "best-practice", title: "Keep a primary and a fallback workflow", body: "Use one platform as your main learning environment and know where to verify account-level information if the trading interface is unclear. For this curriculum, IBKR Desktop is the primary simulated workflow and Client Portal is the account-configuration reference point." },
      { type: "warning", title: "Interface details change", body: "IBKR Desktop updates automatically and its menus evolve. Treat screenshots and menu paths as dated navigation aids. Confirm current release notes or the official user guide when a button, setting or supported feature differs from the lesson." },
    ],
    sources: [
      { title: "IBKR Desktop downloads and release information", url: "https://www.interactivebrokers.com/en/trading/ibkr-desktop-download.php" },
      { title: "Interactive Brokers Client Portal", url: "https://www.interactivebrokers.com/en/trading/client-portal.php" },
      { title: "IBKR GlobalTrader overview", url: "https://www.interactivebrokers.com/en/trading/globaltrader/overview.php" },
      { title: "IBKR platform overview", url: "https://www.interactivebrokers.com/en/whyib/overview.php" },
    ],
  },
  {
    id: "account-setup-permissions",
    route: "start-here/account-setup",
    navRoute: "start-here/account-setup",
    moduleId: "account-setup",
    order: 1,
    title: "Account setup is a risk decision",
    eyebrow: "Account setup & configuration · Lesson 01",
    difficulty: "Beginner",
    estimatedTime: 15,
    verifiedOn: "2026-08-11",
    summary: "Connect account type, permissions, base currency, market data, security and paper trading to the behavior you see in IBKR platforms.",
    objectives: [
      "Separate cash-versus-margin capability from trading permission.",
      "Distinguish account settings from user-level settings.",
      "Build a conservative setup and verification workflow.",
    ],
    sections: [
      { type: "explanation", title: "Configuration creates boundaries", body: "An account type establishes broad financing and settlement capabilities. Trading permissions determine eligible products and regions. Market-data subscriptions affect quote entitlements. Base currency affects reporting and conversion context, while user settings cover login and security details. These controls solve different problems and should be reviewed separately." },
      { type: "important", title: "Cash and margin are not difficulty levels", body: "A margin account can support borrowing and activities unavailable to a cash account, but that capability introduces financing, liquidation and loss risks. Selecting margin does not create a larger safe budget. The appropriate account type depends on jurisdiction, product needs and the risks the account holder understands." },
      { type: "example", title: "Permission does not equal funding", body: "An account can have permission for US stock options yet still be unable to place a specific order because the contract, strategy, buying power or region is not eligible. Conversely, enough cash does not create permission for a product. A successful setup aligns both capability and resources." },
      { type: "checklist", title: "Configuration review", body: "Review the following categories before using a production platform. Menu paths and eligibility rules must be confirmed against the current Client Portal guide.", items: ["Legal account ownership", "Cash or margin capability", "Products and regions", "Base currency", "Market-data status", "Secure login and recovery", "Paper trading access"] },
      { type: "warning", title: "Permissions require honest information", body: "IBKR may base eligibility on financial profile, objectives, experience and regulatory disclosures. Do not exaggerate experience or finances to unlock a product. Restrictions are risk and compliance boundaries, not interface obstacles to work around." },
      { type: "best-practice", title: "Configure the minimum you understand", body: "Request only products and regions needed for the current learning plan, enable secure login, confirm the data status and practice in paper trading. Revisit permissions when a genuine workflow requires them, not simply because a larger list appears more professional." },
    ],
    sources: [
      { title: "IBKR Account Guide", url: "https://www.interactivebrokers.com/en/accounts/account-guide.php" },
      { title: "Client Portal Settings", url: "https://www.ibkrguides.com/clientportal/am_settings.htm" },
      { title: "Trading Permissions", url: "https://www.ibkrguides.com/clientportal/tradingpermissions.htm" },
      { title: "Account Configuration", url: "https://www.ibkrguides.com/clientportal/am_configuration.htm" },
    ],
  },
  {
    id: "why-cant-i-trade-this",
    route: "learn/why-cant-i-trade-this",
    navRoute: "start-here/account-setup",
    moduleId: "account-setup",
    order: 2,
    title: "Why can’t I trade this?",
    eyebrow: "Account setup & configuration · Lesson 02",
    difficulty: "Beginner",
    estimatedTime: 12,
    verifiedOn: "2026-08-11",
    summary: "Diagnose blocked or rejected trades by checking permissions, eligibility, resources, sessions, contract identity and data status in a deliberate order.",
    objectives: [
      "Classify the most common reasons an instrument cannot be traded.",
      "Avoid changing unrelated settings while troubleshooting.",
      "Collect the information needed for a precise support question.",
    ],
    sections: [
      { type: "explanation", title: "A rejection is a category, not a diagnosis", body: "A blocked action can originate from account permission, product eligibility, available funds or margin, a market session, contract selection, an exchange or regional rule, or a temporary platform state. Begin with the exact message and order details rather than guessing from the ticker alone." },
      { type: "checklist", title: "Seven checks in order", body: "Work through these checks without repeatedly resubmitting the same order. Record the contract and message before changing anything.", items: ["Trading permission", "Account or regional restriction", "Product eligibility", "Available cash or margin", "Market session", "Contract identity", "Market-data status"] },
      { type: "example", title: "The option symbol looks correct", body: "A learner selects an AAPL call but the order is blocked. The stock permission, options permission, region, expiration, strike, multiplier and account resources are separate checks. A similar-looking contract or a valid quote does not prove the account is eligible to trade that exact option." },
      { type: "mistake", title: "Do not solve uncertainty by increasing size", body: "Changing quantity, switching to a market order or enabling margin without understanding the message can transform a configuration question into a risk event. Troubleshooting should narrow variables. Preserve the original instruction and modify only the factor supported by evidence." },
      { type: "important", title: "Delayed data is not always the blocker", body: "Market-data entitlement and trading permission are separate. Delayed quotes can make decision-making unsafe, but the account may still accept an eligible order. A data label should trigger a quote-status check, not an assumption about the permission state." },
      { type: "best-practice", title: "Escalate with exact evidence", body: "If the category remains unclear, capture the account mode, contract description, action, quantity, order type, time, status and exact message—without sharing credentials. A precise support request is safer and faster than trying unrelated menu changes." },
    ],
    sources: [
      { title: "Trading and Market Data", url: "https://www.interactivebrokers.com/en/accounts/trading-and-market-data.php" },
      { title: "Client Portal Trading Permissions", url: "https://www.ibkrguides.com/clientportal/tradingpermissions.htm" },
      { title: "About Paper Trading Accounts", url: "https://www.ibkrguides.com/clientportal/aboutpapertradingaccounts.htm" },
    ],
  },
];

export const LESSONS = [...brokerageLessons, ...ibkrFundamentalsLessons];

export function getLessonById(id) {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonByRoute(route) {
  return LESSONS.find((lesson) => lesson.route === route);
}

export function getLessonsForModule(moduleId) {
  return LESSONS.filter((lesson) => lesson.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

export function getAdjacentLessons(id) {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  if (index < 0) return { previous: undefined, next: undefined };
  return { previous: LESSONS[index - 1], next: LESSONS[index + 1] };
}
