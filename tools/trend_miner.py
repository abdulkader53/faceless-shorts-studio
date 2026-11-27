"""Viral Trend & Story Miner for History & Wildlife YouTube Shorts.
Mines public high-retention stories, extracts 2-second psychological hooks,
and maps them directly to the optimal animation style (Paper Atlas, Deep Dive, Tall Tale, etc.).
Operates online (Reddit/Wiki JSON) or offline via a rich curated archive.
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

WORKSPACE = Path(__file__).resolve().parent.parent

# Offline Curated Vault of High-Viral Hooks (Guaranteed to work even offline)
CURATED_VAULT = {
    "history": [
        {
            "title": "The Roman Emperor Who Declared War On The Ocean",
            "hook": "In 40 AD, a Roman Emperor mobilized two hundred thousand soldiers... to declare war on the ocean.",
            "twist": "Caligula ordered his legions to draw their swords, stab the waves, and loot seashells as plunder from the Sea God.",
            "style": "tall-tale",
            "voice": "am_puck",
            "score": 98,
            "category": "Historical Blunder / Insane Rulers",
            "sources": ["Suetonius, The Lives of the Twelve Caesars", "Cassius Dio, Roman History"]
        },
        {
            "title": "How One Small Bakery Burned Down London",
            "hook": "In 1666, eighty-five percent of London burned to the ground... because a royal baker forgot to put out his oven.",
            "twist": "Thomas Farriner swore his oven was cold, but sparks ignited pitch-covered timber houses, leaving 70,000 homeless in four days.",
            "style": "paper-atlas",
            "voice": "bm_george",
            "score": 96,
            "category": "Catastrophes & Animated Maps",
            "sources": ["Samuel Pepys Diary (1666)", "Museum of London Archive"]
        },
        {
            "title": "The Con Artist Who Sold The Eiffel Tower Twice",
            "hook": "In 1925, a con man sold the Eiffel Tower for scrap metal... and then did it a second time.",
            "twist": "Victor Lustig faked official ministry letterheads, took bribes in a Parisian hotel, and fled to Vienna with briefcases of cash.",
            "style": "tall-tale",
            "voice": "am_puck",
            "score": 97,
            "category": "Heists & Loopholes",
            "sources": ["Secret Service Archive", "Paris Police Prefecture Records"]
        },
        {
            "title": "Hannibal's Double Encirclement At Cannae",
            "hook": "An outnumbered Carthaginian army wiped out seventy thousand elite Romans... in under four hours.",
            "twist": "Hannibal intentionally let his center retreat like a flexing bow, until the Roman legions were trapped in a fatal pocket.",
            "style": "paper-atlas",
            "voice": "bm_george",
            "score": 99,
            "category": "Military Tactics & Paper Maps",
            "sources": ["Polybius, The Histories", "Livy, Ab Urbe Condita"]
        },
        {
            "title": "The Ghost Ship of 1872: Mary Celeste",
            "hook": "A merchant vessel was found sailing at full speed... with warm food on tables, but not a single human onboard.",
            "twist": "No signs of struggle, six months of rations intact, and personal belongings untouched. To this day, no body was ever found.",
            "style": "night-file",
            "voice": "bm_fable",
            "score": 95,
            "category": "Dark Historical Mysteries",
            "sources": ["Gibraltar Admiralty Court Records (1872)", "British Maritime Archive"]
        },
        {
            "title": "The 1859 War Triggered By A Hungry Pig",
            "hook": "The United States and the British Empire nearly launched battleships... over a single potato-eating pig.",
            "twist": "An American farmer shot a British pig on San Juan Island, escalating into a tense standoff of 500 troops and five warships.",
            "style": "tall-tale",
            "voice": "am_michael",
            "score": 93,
            "category": "Bizarre Diplomacy",
            "sources": ["US National Park Service Historic Records", "British Admiralty Dispatch 1859"]
        }
    ],
    "wildlife": [
        {
            "title": "The Shrimp That Punches At 8,000°F",
            "hook": "This tiny peacock shrimp delivers a punch that collapses water so fast... it reaches the temperature of the sun.",
            "twist": "Its club accelerates at ten thousand Gs, vaporizing water into cavitation bubbles that flash light and shatter crab shells.",
            "style": "deep-dive",
            "voice": "am_michael",
            "score": 99,
            "category": "Biomechanics & Superpowers",
            "sources": ["Journal of Experimental Biology (Patek et al.)", "Nature Magazine"]
        },
        {
            "title": "Why Lions Refuse To Fight The Honey Badger",
            "hook": "A pride of six hungry lions will back away from this small creature... and for a terrifying reason.",
            "twist": "Its skin is six millimeters thick and so rubbery it can turn around inside a predator's mouth to claw its eyes out.",
            "style": "inside-out",
            "voice": "am_michael",
            "score": 98,
            "category": "Apex Adaptations",
            "sources": ["Smithsonian National Zoo", "Journal of Mammalogy"]
        },
        {
            "title": "What Happens When A Bullet Ant Stings Your Bloodstream?",
            "hook": "This ant's sting causes twenty-four straight hours of agony... comparable to walking on burning coals with rusty nails.",
            "twist": "Its venom contains poneratoxin, a neurotoxin that locks sodium ion channels open, preventing nerves from turning off pain signals.",
            "style": "deep-dive",
            "voice": "am_michael",
            "score": 97,
            "category": "Anatomy & Venom Journey",
            "sources": ["Schmidt Sting Pain Index", "Toxicon Journal"]
        },
        {
            "title": "How Owls Fly In Total Absolute Silence",
            "hook": "Pigeons flap with noisy clatter, but an owl can dive at full speed... without creating a single decibel of sound.",
            "twist": "The leading edge of its wing has microscopic comb-like serrations that slice turbulent air into silent micro-currents.",
            "style": "inside-out",
            "voice": "am_michael",
            "score": 95,
            "category": "Aero-Acoustic Biology",
            "sources": ["Royal Society Open Science", "MIT Fluid Dynamics Laboratory"]
        },
        {
            "title": "The Immortal Jellyfish That Can Reset Its Own Age",
            "hook": "Deep in the Mediterranean swims a creature that is biologically capable of living forever.",
            "twist": "When starved or wounded, Turritopsis dohrnii triggers transdifferentiation, transforming its adult cells back into newborn polyps.",
            "style": "deep-dive",
            "voice": "am_michael",
            "score": 96,
            "category": "Cellular Immortality",
            "sources": ["Biological Bulletin", "National Geographic Research"]
        },
        {
            "title": "What Would You Do If A Grizzly Bear Charges You?",
            "hook": "A nine-hundred-pound grizzly is sprinting straight at you at thirty-five miles per hour. Running is instant suicide.",
            "twist": "If it is a bluff charge, standing your ground stops the attack; but if you climb a tree, grizzlies can easily follow you up.",
            "style": "stick-story",
            "voice": "am_michael",
            "score": 94,
            "category": "Survival Decision Steps",
            "sources": ["US National Park Service Bear Safety", "Interagency Grizzly Bear Committee"]
        }
    ]
}

HOOK_TRIGGERS = [
    r"\baccidentally\b", r"\bdespite\b", r"\bbanned\b", r"\bsecret\b", r"\bnever\b",
    r"\bdeadliest\b", r"\bhotter than\b", r"\bloophole\b", r"\bsurvived\b", r"\bimpossible\b",
    r"\bheist\b", r"\bmystery\b", r"\bpoison\b", r"\bshocking\b", r"\bblunder\b"
]


def score_text(text: str) -> int:
    score = 70
    for pat in HOOK_TRIGGERS:
        if re.search(pat, text, re.IGNORECASE):
            score += 6
    if any(c.isdigit() for c in text):
        score += 5  # Numbers increase curiosity
    return min(99, score)


def fetch_online_reddit(subreddit: str, limit: int = 15):
    """Fetch top recent posts using public read-only JSON."""
    url = f"https://www.reddit.com/r/{subreddit}/top.json?t=month&limit={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": "AntigravityTrendMiner/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            items = []
            for child in data.get("data", {}).get("children", []):
                d = child.get("data", {})
                title = d.get("title", "").strip()
                score = d.get("score", 0)
                if len(title) > 25 and score > 200:
                    items.append({
                        "raw_title": title,
                        "upvotes": score,
                        "url": f"https://reddit.com{d.get('permalink')}"
                    })
            return items
    except Exception:
        return []


def mine_trends(niche: str, count: int = 5):
    """Combine curated vault with online triggers."""
    results = list(CURATED_VAULT.get(niche, []))
    
    # Try fetching online signals if available
    sub = "todayilearned" if niche == "history" else "natureismetal"
    online_posts = fetch_online_reddit(sub, limit=10)
    for p in online_posts:
        title = p["raw_title"]
        # Filter for Til patterns
        clean = re.sub(r"^TIL[:\s,-]+", "", title, flags=re.IGNORECASE).strip()
        hook = f"Did you know that {clean[:1].lower() + clean[1:]}" if not clean.endswith("?") else clean
        style = "paper-atlas" if niche == "history" and ("empire" in clean.lower() or "war" in clean.lower()) else ("tall-tale" if niche == "history" else "deep-dive")
        results.append({
            "title": clean[:70] + "...",
            "hook": hook,
            "twist": "The unbelievable reality behind this event.",
            "style": style,
            "voice": "am_michael" if niche == "wildlife" else "am_puck",
            "score": score_text(clean),
            "category": "Live Online Trend",
            "sources": [p["url"]]
        })
    
    # Sort by score
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return results[:count]


def main():
    parser = argparse.ArgumentParser(description="Mine viral trends for History & Wildlife Shorts")
    parser.add_argument("--niche", choices=["history", "wildlife", "all"], default="all")
    parser.add_argument("--count", type=int, default=5)
    parser.add_argument("--save", action="store_true", help="Save results to channel ideas.json")
    args = parser.parse_args()

    niches = ["history", "wildlife"] if args.niche == "all" else [args.niche]
    
    for n in niches:
        print(f"\n========================================================")
        print(f"🔥 TOP VIRAL HOOKS FOR: {n.upper()}")
        print(f"========================================================")
        trends = mine_trends(n, count=args.count)
        for i, t in enumerate(trends, 1):
            print(f"\n#{i} [{t['style'].upper()}] (Score: {t['score']}/100) - {t['title']}")
            print(f"   🎯 Hook (0-2s): \"{t['hook']}\"")
            print(f"   ⚡ Twist: {t['twist']}")
            print(f"   🎙️ Recommended Voice: {t['voice']}")
            print(f"   📚 Sources: {', '.join(t['sources'])}")

        if args.save:
            dest_file = WORKSPACE / f"channel-{n}" / "ideas.json"
            dest_file.write_text(json.dumps(trends, indent=2))
            print(f"\nSaved {len(trends)} curated ideas to: {dest_file.relative_to(WORKSPACE)}")


if __name__ == "__main__":
    main()
