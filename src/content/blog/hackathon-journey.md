---
title: "Hackathon Journey"
date: 2025-10-05T00:00:00
summary: "How my team built humanSign, an AI-text detector, and walked out of the hackathon as 2nd Runner-Up — plus what the judges actually rewarded."
author: "Sumit Poudel"
tags: ["wins"]
---

 ![The hackathon venue where my team presented humanSign](/blogs/hackathon.jpg)

The night before the actual Hackathon, It was intense knowing it will be a tough competation and i was hoping not to embarrce my self in front of all the judges and crowd.

I went in with curiosity.
I walked out as part of the 2nd Runner-Up team, with a project I was genuinely proud of.

The Challenge

The goal was simple: build something meaningful under pressure.

The reality was tougher.
Shifting requirements, time running out, bugs appearing out of nowhere, and constant context-switching made the process chaotic in the best way possible.

But that’s exactly what a hackathon is supposed to feel like.

**Our Project: humanSign**

Our team built something we had never attempted before — an AI-powered Human Detection System based entirely on keystroke patterns.

***How It Works***
- We capture raw typing events:
- Key press (down) timestamps
- Key release (up) timestamps
- Delays between consecutive keys
- Hold times per key
- These values form a behavioral signature for each user.
- We convert those signatures into feature vectors and feed them into an ML model.
- The model predicts whether the input is:
  - Human
  - Bot/Script

This method is privacy-friendly because it doesn’t track what is typed — only how it’s typed.

**Why It Matters**

Bot detection traditionally relies on IP, captchas, or rate limiting.
Our system focuses on behavior, making it extremely difficult for bots to mimic.

It’s lightweight, accurate, and can be integrated into login pages, forms, or security checkpoints.
Building Under Pressure
Creating this system within a limited time required:
Real-time event capturing
Feature engineering
Training and tuning a model
Designing a simple interface
Testing under unpredictable conditions
Preparing a clear pitch for the judges
Each step was a mini-challenge.
Each challenge pushed us to think faster and work smarter.

**The Moment That Counted**

When we presented the demo — typing a short sentence and watching the system instantly classify the input as human — the judges leaned forward.

That was the moment we knew the project had impact.
Being announced as the 2nd Runner-Up was the final confirmation.

**What I Learned**

The hackathon reinforced a few important lessons:
Good ideas come from simple observations.
Machine learning shines when paired with human behavior patterns.
Teamwork and clarity matter as much as coding skills.
A working prototype beats a perfect plan.
Most importantly, it showed me that innovation doesn’t need huge systems.
Sometimes, it starts with something as small as a keystroke.

Source: [https://github.com/sumit-poudel](https://github.com/sumit-poudel)

