## Inspiration

It was a Thursday afternoon in Bengaluru. One of our teammates was waiting for a Zomato order that never came.

The rain had been falling for three hours. Not the romantic kind — the kind that floods underpasses, stalls traffic for kilometres, and makes two-wheeler delivery operationally impossible. He opened the app. No delivery partners available. He assumed they'd all logged off.

But that night, scrolling through a Reddit thread, he found out what actually happened. The delivery partners hadn't logged off. They were sitting at tea stalls, under petrol station canopies, at roadside dhabas — waiting for the rain to stop, watching their earnings evaporate hour by hour. One partner in the thread had done the math publicly: he'd lost ₹840 that Thursday. Rent was due in four days. He had no insurance. There was no claim to file. There was nothing.

That partner's name wasn't Raju. But his story was Raju's story — and the story of 11 million delivery partners across India who are the engine of our digital economy, and who have never once had a safety net.

We spent the next two days mapping the insurance landscape for gig workers in India. What we found was almost surreal. Health insurance doesn't cover lost income. Vehicle insurance doesn't cover a bad weather week. Personal accident policies don't pay out for a rain event. There is not a single insurance product available in India today — not one — that says to a delivery partner: *if the sky falls on you through no fault of your own, we will make sure you don't fall with it.*

That gap isn't a product gap. It's a systemic failure. And it repeats itself every monsoon, every heatwave, every time a local bandh shuts down a city's pickup points and 10,000 delivery partners absorb the entire financial loss without a word.

We built InsureFlow because that's wrong. And because — when we looked carefully — the technology to fix it already exists. It was just never pointed at this problem.

---

## What it does

InsureFlow is India's first **parametric weekly earnings shield** for Zomato food delivery partners. It doesn't ask gig workers to understand insurance. It doesn't ask them to file claims. It doesn't ask them to do anything at all.

It just watches. It learns. And when something out of their control takes money out of their pocket — it puts it back.

---

**The core concept: the Protection Floor.**

When Raju onboards InsureFlow, our ML engine ingests 12 weeks of his Zomato earnings history and builds what we call his **Earnings DNA** — a personal, granular baseline of when he works, where he works, what he earns under normal conditions, how his income behaves on rainy Tuesdays versus sunny Saturdays, and what his expected velocity looks like at 11 AM on a Thursday in HSR Layout.

From that, we compute his **Protection Floor** — set at 75% of his weekly baseline. For Raju, that's ₹4,350.

The promise is one sentence: *if your week falls below ₹4,350 because of a verified external disruption, InsureFlow pays the gap. Automatically. You never file anything.*

His weekly premium: ₹48. Less than the chai he buys at the tea stall while waiting for the rain to stop.

---

**The three phases.**

InsureFlow isn't just an insurance product. It's a financial co-pilot that operates across Raju's entire week — before, during, and after a disruption.

**⚡ Phase 1 — Warn.** Every morning at 6:30 AM, before Raju starts his shift, InsureFlow pushes him a personalised advisory. Not a generic weather alert. Something specific to him, his zones, his historical performance patterns. *"BTM Layout has a 74% disruption probability today based on IMD's 6-hour rainfall forecast. Your peak earning window is 9 AM–12 PM. If you complete your morning batch and move to HSR Layout by 2 PM, estimated earnable today: ₹880. Post-rain demand surge predicted in HSR at 4 PM — highest order density of the week."*

The AI zone heatmap fuses four live data sources simultaneously: IMD rainfall API, CPCB AQI feed, historical zone-level waterlogging data, and — most importantly — the anonymised GPS activity of every active InsureFlow partner across the city. When 80 partners in Koramangala go inactive at 11:15 AM, that signal reaches InsureFlow's peer network graph before it reaches any weather API. The workers are the fastest sensor network in the city. We just listen to them.

**🛡️ Phase 2 — Protect.** By 11 AM on Thursday, Raju's LSTM earnings velocity model flags something. He should have earned ₹620 by now. He's earned ₹218. Velocity ratio: 0.35 — well below the 0.60 threshold. The pre-validation pipeline starts automatically. GPS confirms he's in BTM Layout, inside the IMD rain boundary. 84 of 120 active partners in his zone show identical inactivity — peer corroboration confirmed. Isolation Forest fraud score: 0.02 — clean.

InsureFlow doesn't wait for Sunday. A **Bridge Advance** of ₹200 hits his UPI in 4 minutes 18 seconds. Not because Sunday settlement is wrong — it's accurate. But because Raju needs fuel money today. Rent doesn't wait for weekly accounting cycles. The bridge advance is settled automatically against the Sunday final claim.

**💸 Phase 3 — Pay.** Sunday evening. Raju is watching TV. He has filed nothing. The week closes. InsureFlow runs the auto-settlement: baseline ₹5,800, floor ₹4,350, actual earned ₹3,980, bridge already paid ₹200, balance owed ₹170. Four validation checks complete in parallel. ₹170 hits his UPI in 58 seconds. He gets a push notification.

He never knew the system was running.

---

**The five parametric triggers.**

Every trigger is calibrated to the specific income impact threshold for two-wheeler delivery in Indian urban conditions — not generic meteorological benchmarks.

| Trigger | Type | Threshold | Calibration Rationale |
|---|---|---|---|
| Heavy Rainfall | Environmental | IMD ≥ 65mm in 3-hour window in active zone | Industry research: two-wheeler delivery operationally halts at sustained 65mm+ rainfall |
| Extreme AQI | Environmental | CPCB AQI ≥ 300 sustained ≥ 4 hours | Government outdoor work advisory threshold; order volume drops 55%+ historically at this level |
| Extreme Heat | Environmental | IMD heat alert + temp ≥ 44°C for ≥ 3 peak hours | NIOH outdoor labour safety threshold; delivery acceptance rates fall 60%+ above 44°C |
| Local Curfew / Bandh | Social | Govt alert API OR ≥ 70% zone partners inactive simultaneously | Hyperlocal disruptions invisible to weather APIs — detected by peer network signal before any official source |
| Earnings Velocity Crash | Platform | 2-hour actual earnings < 40% of personal baseline + confirmed external signal | Catches micro-disruptions below macro-trigger thresholds — the gap most parametric products miss |

Trigger 5 — the earnings velocity crash — is our most important innovation. Traditional parametric insurance is binary: the event either crosses the threshold or it doesn't. But real income loss is granular. A partial flooding that doesn't technically cross 65mm still reduces Raju's order acceptance by 40%. A zone-level bandh that affects three streets isn't in any government API. Trigger 5 catches the long tail of disruption that every other parametric product misses entirely — using the worker's own earnings as the primary signal, cross-referenced against external confirmation.

---

## How we built it

We made one architectural decision early that shaped everything else: **no single data source would be trusted in isolation.**

Not GPS. Not weather APIs. Not the worker's own earnings report. Not the peer network. Each layer had to be independently verifiable, and the final decision had to emerge from the convergence of multiple orthogonal signals. This made the system harder to build. It also made it dramatically harder to fool.

---

**Frontend — built for Raju's phone, not our laptops.**

Raju uses a Redmi 9A. 2GB RAM. Fluctuating mobile data. The moment it rains, his network degrades precisely when he needs InsureFlow most. We built a React 18 Progressive Web App — installs to the home screen without a Play Store download, works on any Android browser, maintains core functionality with partial offline support via service workers, and pushes notifications through Firebase Cloud Messaging even on degraded connections. This wasn't a design preference. It was the only honest choice.

**Backend — real-time and reliable.**

Node.js + Express REST API. PostgreSQL for worker profiles, earnings history, weekly premiums, and claim audit trails. WebSockets for live zone map updates — the heatmap refreshes every 60 seconds across all active zones. The claims pipeline runs as an async job queue so Sunday night settlement for 1,247 workers doesn't block the real-time monitoring stack.

**The ML stack — three models, each with a specific job.**

The *Gradient Boosted Regressor* handles weekly premium calculation. Input features: zone risk score (7-day rolling average), IMD 7-day forecast confidence score, worker's personal earnings variance index (σ from their 12-week baseline), and historical claim frequency. Output: a personalised weekly premium between ₹35 and ₹80, recalculated fresh every Monday morning and delivered with a plain-language explanation of every factor that moved it that week.

The *LSTM time-series forecaster* handles earnings velocity. Trained on 12-week personal baselines segmented by day, hour, zone, weather condition, and festive calendar. It outputs expected earnings at each hour of Raju's shift — not a generic city average, but his specific historical pace for that day, that zone, that time of year. This personal baseline is what makes the velocity crash detection meaningful: the model knows that Raju always earns ₹620 by 11 AM on Thursdays in BTM Layout, and flags deviation against that, not against an average.

The *Isolation Forest* handles fraud detection — an unsupervised anomaly detection model that computes a composite fraud score across 6 independent signal layers. No fraud label training data needed. The model learns what normal looks like across thousands of claims and flags the ones that don't fit. Score 0–0.40: auto-approve. 0.41–0.69: soft flag, payout proceeds. 0.70–0.84: hold and re-verify. 0.85–0.94: human review. 0.95+: auto-reject. The graduated ladder is as important as the model — a system that treats 0.70 the same as 0.95 will false-flag honest workers in storms and lose the product's entire reason for existing.

**Data integrations.**

Live: IMD Rainfall API, CPCB AQI real-time feed, Google Maps Geocoding API for zone boundary polygons and cell tower mapping.

Mocked for demo (production-ready architecture): Zomato partner API for earnings history and order density, GPS activity feed, government curfew/bandh alert API.

Payments: Razorpay test mode with realistic UPI latency simulation. The settlement pipeline is built to plug into live Razorpay UPI in production with a configuration change.

---

**The adversarial defense — built in 24 hours.**

With less than a day before the Phase 1 deadline, the hackathon dropped a live threat brief: a 500-person Telegram syndicate had exploited a competitor's GPS-based parametric system, spoofed their locations into red-alert zones from their homes, and drained the liquidity pool in hours. Simple GPS verification was officially dead.

We had one night.

The insight that saved us came from thinking about what GPS actually is: a *claim*. It's a number a device reports about itself. Behavior is *evidence*. It's what multiple independent systems observe about a device from the outside. You can spoof a claim. You cannot simultaneously spoof every independent signal that observes you.

We built a 6-layer defense where each layer catches a different attack vector and where defeating any single layer leaves five others intact:

**Layer 1 — Kinematic Physics.** GPS velocity is computed between the last 5 pings. A movement speed of 2,400 km/h between pings 30 seconds apart is not network jitter — it's a mock location app. GPS jitter variance below 2 metres over 10 minutes is not a strong signal — it's a frozen coordinate. Real GPS fluctuates naturally. Mock GPS doesn't.

**Layer 2 — Sensor Fusion.** A mock location app spoofs GPS coordinates. It does not spoof the accelerometer, cell tower connection, or ambient audio classification. A delivery partner on a bike in rain shows road-vibration accelerometer patterns, connects to a cell tower inside the affected zone, and shows outdoor ambient audio classification. A person sitting at home shows stationary accelerometer readings, connects to their home cell tower (potentially 14km from the claimed zone), and shows indoor classification. All four signals must be coherent. None of the three non-GPS sensors can be defeated by a Telegram-distributed app without rooting the device.

**Layer 3 — Earnings DNA Coherence.** The Earnings DNA knows that Priya R. has never worked a Thursday in 12 weeks of history. When she submits a claim for a Thursday rain disruption, her fraud score doesn't start at 0. Her behavioral baseline has already answered the question of whether she would have been working. A genuine disruption requires a genuine worker — someone who was in their normal working pattern when the disruption hit.

**Layer 4 — Peer Network Statistical Validation.** This is where coordinated fraud rings expose themselves. Genuine disruption events produce organic inactivity — partners go inactive gradually, over 20–30 minutes, in a spatial pattern that matches the weather boundary polygon from IMD. Coordinated fraud produces a statistical cliff — 50 claims submitted within 90 seconds, from workers appearing in zones they have never historically worked in, with a spatial distribution that doesn't match the storm's footprint. The temporal spike index flags this immediately. The very act of Telegram coordination — the thing that makes the syndicate powerful — is the statistical signature that condemns them.

**Layers 5 and 6 — Device Fingerprinting and Composite Scoring.** Device fingerprint hash deduplication catches family fraud rings. IP clustering catches household coordinated submissions. The Isolation Forest composite score synthesises all signals into a single number that drives the graduated response — auto-approve, soft flag, hold, review, or reject.

The UX balance was as important as the detection logic. During an active IMD red alert, GPS continuity requirements are automatically relaxed — bad weather degrades GPS signal, and a genuine worker in a storm should not be penalised for their phone having a bad minute. The network drop protocol uses the last confirmed position plus the IMD storm boundary to impute location during signal gaps. Workers in the hold tier receive one message: *"Your claim is processing — verification sometimes takes longer during strong weather events. No action needed. Expected resolution: 2 hours."* No accusation. No form. No sense of being investigated.

The syndicate's coordination is their confession. The honest worker's history is their defense.

---

## Challenges we ran into

**The false positive paradox nearly broke us.** The most dangerous weather event for GPS signal quality is a heavy monsoon — exactly when the parametric trigger fires and exactly when we need GPS to be reliable. A worker with degraded GPS during the storm we're supposed to be paying them for looks, from the outside, like a spoofed signal. We had to build a system that understood the difference between "GPS is unreliable because weather is bad" (legitimate) and "GPS is unreliable because someone is manipulating it" (fraud). The answer was sensor fusion and contextual GPS relaxation during confirmed IMD events — but getting to that answer took us three false starts and a lot of late-night debugging.

**Calibrating the parametric thresholds.** 65mm feels like a specific number. It took real research to get there. We read IMD red alert definitions, BBMP waterlogging data for Bengaluru's flood-prone zones, Zomato delivery acceptance rate correlations during monsoon seasons, and NIOH outdoor labour safety guidelines for heat. Every threshold in our trigger table has a source. None of them are round numbers chosen for convenience. Getting this wrong in either direction — too sensitive or too conservative — breaks the product's financial model and its worker trust simultaneously.

**The cold start problem for new workers.** A worker with three weeks of data doesn't have a reliable personal baseline. We built a zone-level proxy model — median earnings profiles for workers in similar zones at similar seniority levels — that activates for new workers and transitions smoothly to their personal DNA as history accumulates. The transition logic had to be invisible to the worker. They always see "their" floor — they don't need to know whether it's computed from their personal history or a zone proxy.

**The Bridge Advance settlement reconciliation.** Paying a partial advance mid-week and settling it correctly against a weekly claim on Sunday sounds simple. The edge cases made it complex. What if the final weekly earnings recover above the floor after the bridge is paid? What if a second trigger fires in the same week? What if the bridge advance was paid in error due to a fraud flag that comes back positive on deeper review? Each scenario needed a defined reconciliation rule and an audit trail. Getting the settlement logic airtight without making it visible to the worker required more backend work than any other single feature.

**24 hours to rebuild fraud architecture.** The adversarial threat brief arrived with less than a day to the deadline. We had a working Isolation Forest model. We did not have sensor fusion, kinematic validation, or syndicate detection. Rebuilding the fraud architecture from a single GPS-based check to a 6-layer sensor fusion defense — and doing it in a way that was architecturally coherent, technically implementable, and didn't create new false positive risks for honest workers — in under 24 hours is the hardest thing we've done in this hackathon. We are glad it happened. The product is genuinely better for it.

---

## Accomplishments that we're proud of

**The peer network insight.** We came in expecting weather APIs to be the primary disruption signal. We left understanding that 1,200 delivery partners moving through the same city are a faster, more granular, and more hyperlocal sensor network than any government API. A bandh that isn't in any official database shows up in the peer activity graph within minutes. A micro-flooding event in a specific neighbourhood — too small for IMD to flag — is visible immediately in the inactivity pattern of the 15 partners who work that area. This insight fundamentally changed how we think about parametric insurance. The policyholders are not just customers. They are the data infrastructure.

**Zero-touch claims — end to end.** The full pipeline from parametric trigger detection to UPI confirmation runs without a single human action from the worker. In an industry where claims processes routinely take 30 to 90 days, a 58-second auto-settlement isn't just faster — it's a different product category entirely. It changes what insurance means for someone who has never trusted an insurance company before.

**The Bridge Advance as a product concept.** Every parametric insurance product settles at the end of the coverage period. That's accurate. It's also practically insufficient for a worker who needs fuel money on Wednesday. The Bridge Advance — a partial real-time payout settled against weekly finalization — solves a problem that didn't exist in the product literature because nobody had asked the right question: *when* does Raju actually need the money? The answer turned out to be: not Sunday. Today.

**The adversarial defense architecture.** Building a 6-layer fraud defense in under 24 hours that is simultaneously technically rigorous, practically implementable, and UX-safe for honest workers — without false-flagging the people it's supposed to protect — is the accomplishment we'll describe first when we talk about this project.

**Raju's year — 280% ROI.** In our modeled scenario: ₹2,496 in premiums paid. ₹9,480 returned across 9 auto-payouts. 0 claims filed. That's a 280% return. More importantly, that's 9 school fees. 9 rent payments. 9 weeks where Raju's family didn't have to make a terrible choice between food and EMI.

---

## What we learned

**Insurance is a trust product before it is a financial product.** Raju doesn't distrust insurance companies because he doesn't understand insurance. He distrusts them because he's watched people in his community file claims and receive nothing. Every design decision in InsureFlow — the zero-touch claims, the plain-language premium explanation, the "no action needed from you" notification, the Bridge Advance — is a trust-building decision first. The technology enables the trust. The trust is the product.

**The workers are smarter about their own risk than any model we can build.** The Earnings DNA baseline is powerful. The IMD API is useful. But when we looked at what the peer network signal detected — hyperlocal bandhs, micro-flooding, road closures that affected three streets — we realized the delivery partners themselves were carrying risk knowledge that no external data source had access to. The best thing we could do was build a system that aggregated and formalized that knowledge rather than trying to replace it.

**Fraud systems are primarily a UX design problem.** The machine learning is the easy part. The hard part is building a fraud response that catches bad actors without treating every honest worker like a suspect. The graduated confidence ladder, the contextual GPS relaxation, the benefit-of-the-doubt protocol, the notification copy that says "no action needed" instead of "your claim is under investigation" — these are design decisions that required more careful thought than the Isolation Forest implementation. A fraud system that false-flags honest workers during storms is worse than no fraud system at all. It destroys the product at the exact moment that matters most.

**Parametric triggers need to be calibrated to behavioral impact, not meteorological benchmarks.** "It rained" is not a trigger. "It rained enough that two-wheeler delivery in this city operationally halts" is a trigger. The difference between 50mm and 65mm is the difference between a system that pays out on light drizzle and one that pays out on genuine income loss. Getting this right required us to think like delivery partners, not like meteorologists.

**Building under pressure reveals what you actually believe.** When the adversarial threat brief arrived at hour 47 of a 48-hour window, we had two options: add a surface-level GPS cross-check and call it done, or actually rebuild the fraud architecture to be genuinely defensible. We chose the second. Not because it was easier — it was significantly harder. But because the whole point of InsureFlow is to be a product that Raju can trust completely. A fraud system with a known exploit would have undermined every other design decision we made. You can't half-commit to trust.

---

## What's next for InsureFlow

**Phase 2 — Protect.** The full product comes alive. Registration flow, insurance policy management, dynamic premium calculation, and claims management — all functional. Three to five automated parametric triggers deployed against live IMD and CPCB APIs. The zero-touch claim pipeline runs its first real end-to-end test with actual GPS data, actual velocity monitoring, and actual UPI sandbox payouts. The earnings monitor and zone heatmap go live with real partner data. We find out which assumptions in our architecture hold and which ones need to be revisited.

**Phase 3 — Scale.** The Isolation Forest fraud model trains on real claim data. The sensor fusion pipeline integrates live accelerometer signals and cell tower data. The peer network graph scales beyond the demo to a genuine distributed signal network. The Razorpay UPI integration moves from sandbox to live. The insurer analytics dashboard — loss ratios by zone, next-week disruption forecasts, fraud queue with evidence trails — becomes a functional product that an underwriter can actually use to manage a book of business.

**Beyond the hackathon — what InsureFlow becomes.**

The parametric trigger architecture is platform-agnostic. Everything we built for Zomato food delivery works for Swiggy, Zepto, Amazon Flex, Porter, and Dunzo. The Earnings DNA model adapts to any gig worker category where income is both measurable and disruption-sensitive. The peer network signal becomes more powerful as the partner base grows — 10,000 partners is a good sensor network. 500,000 partners is an extraordinary one.

We want to build a **Delivery Circle** layer — groups of 8 to 10 partners in the same zone who pool a small top-up contribution in their strong weeks to support each other in their bad ones. India already understands this concept through the SHG model. InsureFlow provides the infrastructure to make it digital, transparent, and automatic.

The long-term ambition is a licensed IRDAI-compliant parametric insurance product — built in partnership with a reinsurer — that becomes the default financial safety net for every gig worker on every platform in India.

**The north star is a specific moment.** The day InsureFlow processes its one-millionth automatic payout — to a delivery partner who never filed a claim, never called anyone, never knew the system was running in the background of a terrible Thursday — that's the day we'll know we built something that mattered.

---

*11 million people keep India fed, delivered, and moving. They deserve more than a tea stall in the rain.*

*InsureFlow. Warn. Protect. Pay.*

*Because ₹450 on a Sunday night means Raju's daughter goes to school on Monday.*
