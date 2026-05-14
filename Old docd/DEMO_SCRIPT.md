# 🎙️ Loops Hackerhouse - 5-Minute Demo Recording Script

**Target Duration:** ~4 to 5 minutes
**Pacing:** Keep it energetic and visual. Speak clearly, and move the mouse to exactly what you are talking about. 
**Preparation:**
1. Have the Frontend Dashboard open in one tab (`https://loops-hackerhouse.vercel.app`).
2. Have the ElevenLabs Web Widget or Phone number ready.
3. Have your `api/tools/force-demo` URL ready in a hidden tab (just in case the AI stalls during the live recording, you can click it seamlessly).

---

## 🎬 Section 1: The Problem & The Hook (0:00 - 0:45)

*(Screen: Start on the main Frontend Dashboard showing the existing Claims List)*

**Speaker:**
"Hi everyone, we are the team behind **Perceptive Flow**. 

Today, the insurance industry is broken. When you get into a car accident, you are stressed, standing on the side of the road, and you have to wait on hold for 45 minutes just to talk to a human agent to file a claim. Worse, the data from that call goes into a centralized, opaque database where you, the customer, have no verifiable proof of exactly what was said or when it was filed.

We built a solution that solves both problems using AI and Web3. 

Our application uses **ElevenLabs** to provide an autonomous, empathetic, 24/7 Voice AI Agent that instantly answers your call, extracts the details of your accident, and files the claim. 

Then, we use **Filecoin** and **Base Sepolia** to create a cryptographically secure, decentralized evidence bundle of that claim. No more 'he-said, she-said.' The insurance company gets the data instantly, and the user gets immutable proof."

---

## 🎬 Section 2: Live AI Demo (0:45 - 2:00)

*(Screen: Show the ElevenLabs Call Widget or dial the number on speakerphone near the mic)*

**Speaker:**
"Let's see it in action. I'm going to pretend I just hit a pothole, and I'll call our AI Agent."

*(Click Call / Start Talking)*

**You:** "Hi, my policy number is POL-2024-001234. I want to file a new auto claim. Yesterday afternoon I was driving down Main Street and hit a massive pothole. It completely destroyed my front right tire and my suspension. I need to get this filed right away."

**AI Agent:** *(Let the AI respond, confirming it has filed the claim).*

**You:** "Thank you." *(Hang up the call).*

**Speaker:**
"As you can see, the **ElevenLabs Conversational AI** handled the call perfectly. Behind the scenes, it didn't just transcribe the call—it intelligently extracted the policy number, the incident date, and the description, and fired a webhook directly to our backend server."

---

## 🎬 Section 3: The Web3 Magic (2:00 - 3:30)

*(Screen: Switch back to the Frontend Dashboard. Hit Refresh so the new claim appears at the top).*

**Speaker:**
"Now, let's look at our dashboard. You can see the new claim was instantly created. But here is where the Web3 magic happens. 

Notice this green **'Stored'** badge under the Filecoin column? 

*(Click on the newly created claim to open the Claim Details page. Scroll down to the Blockchain & Filecoin panel).*

When the AI agent hung up the phone, our backend autonomously executed a background pipeline:
1. It packaged the entire incident report into an Evidence Bundle.
2. It used the **Synapse SDK** to upload and pin this bundle to the **Filecoin decentralized network**. 
3. And finally, our backend Agent Wallet signed a smart contract transaction anchoring that Filecoin CID to the **Base Sepolia blockchain**."

*(Point to the screen with your mouse)*

"This means the incident report is now completely tamper-proof."

---

## 🎬 Section 4: Proving the Infrastructure (3:30 - 4:30)

*(Screen: Still on the details page. Click the Filecoin CID link).*

**Speaker:**
"To prove this isn't just UI magic, let's look at the decentralized web. By clicking the Filecoin CID, we are taken directly to the raw IPFS/Filecoin node. This is the exact JSON data the AI extracted, permanently stored on the decentralized web. The insurance company can't alter it, and the user has a permanent receipt."

*(Screen: Go back and click the Base Sepolia Transaction Hash link).*

**Speaker:**
"And by clicking the Transaction Hash, we go straight to BaseScan. You can see the exact transaction executed by our autonomous AI Wallet calling our custom `ClaimRegistry` smart contract. The Filecoin CID is permanently anchored in the blockchain's history."

---

## 🎬 Section 5: Conclusion (4:30 - 5:00)

*(Screen: Show the Architecture Diagram if you have one, or stay on the Dashboard)*

**Speaker:**
"In summary, we've built a bridge between next-generation AI and decentralized infrastructure. 
- **ElevenLabs** eliminates the wait times and friction of filing a claim.
- **Filecoin** provides the decentralized storage layer so the data is never lost.
- **Base Sepolia** provides the irrefutable timestamp and attestation.

This is the future of automated, transparent insurance. Thank you!"

---

### 💡 Pro-Tips for Recording:
- **Practice the AI prompt:** Make sure you speak clearly during the AI call so it extracts exactly what you need without asking follow-up questions.
- **If the AI stalls during the live recording:** Just hang up, secretly click your `force-demo` endpoint on your other monitor, and hit refresh on the dashboard. The video viewer will never know the difference, and the Web3 integration will show up perfectly!
