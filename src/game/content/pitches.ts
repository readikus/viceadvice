import type { PitchBrief } from "../types";

/**
 * The deck of eight. The engine deals five a night, at least two of each kind.
 *
 * DRAFT CONTENT: the story stream refines the wording, and someone with compliance
 * knowledge must sense-check every legit pitch before the game is shown beyond the offsite.
 *
 * All firms, numbers and websites are fictional. Phone numbers use Ofcom's ranges
 * reserved for drama (020 7946 0xxx, 0161 496 0xxx, 0113 496 0xxx, 0117 496 0xxx).
 *
 * Design note: every legit pitch comes from a different authorised firm Kenny "works
 * with", so a player cannot just memorise one good firm number and win.
 */
export const PITCHES: PitchBrief[] = [
  // ------------------------------------------------------------------ scams
  {
    id: "free-pension-review",
    title: "Free pension review",
    kind: "scam",
    openingLine: "I called you, amigo, because I care. When did anyone last look at your pensions for free?",
    product:
      "A free pension review that ends with moving all three pots into an overseas fund Kenny's associates run.",
    talkingPoints: [
      "He phoned the player out of the blue and is proud of it.",
      "The review is free, so what is there to lose?",
      "Their pensions are 'sleeping' in the UK and could be 'working' offshore.",
      "He handles all the paperwork; the player just signs the transfer form.",
    ],
    redFlags: [
      { id: "cold-call", label: "Cold contact", why: "Cold calls about pensions are banned in the UK. A legitimate firm won't ring you out of the blue." },
      { id: "free-review", label: "A 'free' review", why: "Free pension reviews are a classic hook for moving your money somewhere it can't be recovered." },
      { id: "overseas", label: "Moving your pension overseas", why: "Overseas schemes are much harder to check and to get money back from." },
    ],
    whyItHoldsUp: [],
    firm: { name: "Sunrise Pension Partners", frn: "614207", phone: "020 7946 0412", website: "sunrisepensionpartners.co.uk" },
    registerResult: "not_listed",
    pressureLine: "My review slots fill up fast, my friend. I can only hold yours until the end of the night.",
    brochure: "pension-transfer",
    signDelta: -120000,
  },
  {
    id: "cayman-property-fund",
    title: "Cayman property fund",
    kind: "scam",
    openingLine: "Twelve percent, guaranteed. Every year. Beachfront in the Caymans, amigo, it's practically a law of nature.",
    product: "An unregulated overseas property fund promising guaranteed 12 percent a year.",
    talkingPoints: [
      "Luxury apartments in the Cayman Islands, 'always full'.",
      "His guy in the Caymans has never had a bad year.",
      "The 12 percent is guaranteed, in writing, on the brochure.",
      "If asked about regulation, it's 'offshore, so the rules are friendlier'.",
    ],
    redFlags: [
      { id: "guaranteed-returns", label: "Guaranteed high returns", why: "No real investment can guarantee 12 percent a year. High return always means high risk." },
      { id: "unregulated", label: "Unregulated", why: "Unregulated investments don't give you access to the Financial Ombudsman or the compensation scheme." },
      { id: "overseas", label: "Overseas and hard to check", why: "If it goes wrong offshore, getting your money back is very unlikely." },
    ],
    whyItHoldsUp: [],
    firm: { name: "Valentine Cayman Holdings", frn: null, phone: "020 7946 0733", website: "valentinecayman.ky" },
    registerResult: "none_given",
    pressureLine: "The last units go tonight. The boat leaves at midnight, and so does this deal.",
    brochure: "fund",
    signDelta: -100000,
  },
  {
    id: "tax-free-loophole",
    title: "Take it all tax-free",
    kind: "scam",
    openingLine: "Little loophole, my friend. Your whole pension, in your hand, tax-free. Your money, now.",
    product:
      "A 'pension unlocking' scheme that moves the pots into a new arrangement and pays most of it out as a so-called loan or cashback, with Kenny taking a big fee.",
    talkingPoints: [
      "It's 'perfectly legal', his lawyer in Miami checked it.",
      "Why wait? Take it all now and enjoy it.",
      "It's paid as a 'loan' so the taxman never sees it.",
      "His fee is only 20 percent, which he calls 'a bargain for freedom'.",
    ],
    redFlags: [
      { id: "all-tax-free", label: "All of it tax-free", why: "Normally only 25 percent of a pension can be taken tax-free. The rest is taxed as income." },
      { id: "liberation", label: "A 'loan' or 'cashback' from your pension", why: "Unauthorised payments from a pension can be taxed at up to 55 percent, on top of losing the money." },
      { id: "huge-fee", label: "A huge fee", why: "Fees of 20 percent or more are a sign the scheme exists to pay the seller, not you." },
    ],
    whyItHoldsUp: [],
    firm: { name: "Liberty Pension Solutions", frn: "587301", phone: "0161 496 0187", website: "libertypensionsolutions.co.uk" },
    registerResult: "not_listed",
    pressureLine: "The loophole closes when the tax year turns, amigo. After tonight I can't promise anything.",
    brochure: "pension-transfer",
    signDelta: -110000,
  },
  {
    id: "vip-club",
    title: "Kenny's VIP club",
    kind: "scam",
    openingLine: "Members only, my friend. I don't offer this to everybody. Decide tonight and you're in.",
    product:
      "An exclusive members-only investment club, fronted under the name of a real authorised firm with a cloned number.",
    talkingPoints: [
      "The club is invitation only and the player has been chosen.",
      "Members get 'insider' deals the public never sees.",
      "Kenny gives a real-looking firm number, and it really is on the register, but his phone and website are different.",
      "If the player mentions the register's contact details, he says that's 'the old office'.",
    ],
    redFlags: [
      { id: "time-pressure", label: "Decide tonight", why: "Real advisers give you time. Pressure to decide now is there to stop you checking." },
      { id: "exclusivity", label: "Exclusive, invitation only", why: "Making you feel special is a way to switch off your doubts." },
      { id: "clone", label: "Cloned firm details", why: "The number is real but the phone and website aren't. Always contact a firm using the details on the register." },
    ],
    whyItHoldsUp: [],
    firm: { name: "Harbourside Wealth Management", frn: "702918", phone: "020 7946 0951", website: "harbourside-wealth-vip.com" },
    registerResult: "clone",
    pressureLine: "The membership list closes at midnight. After that, the velvet rope goes up.",
    brochure: "vip-club",
    signDelta: -90000,
  },

  // ------------------------------------------------------------------ legit
  {
    id: "bring-pots-home",
    title: "Bring your pots home",
    kind: "legit",
    openingLine: "Three old pensions? Let's make it one, cheaper. Easier to keep an eye on, my friend.",
    product: "Combining three old workplace pensions into one lower-cost pension, after checking each one first.",
    talkingPoints: [
      "One pot is easier to track and often cheaper.",
      "Before moving anything, he checks each pension for exit fees.",
      "He checks for valuable guarantees, like a guaranteed annuity rate, that would be lost by moving.",
      "If any pot is a final-salary pension, it may be best left where it is, and moving one worth over 30 thousand pounds needs regulated advice.",
      "No rush: he'll send the comparison and the player can think it over.",
    ],
    redFlags: [],
    whyItHoldsUp: [
      "Combining pots can cut fees and make retirement easier to plan.",
      "He checked exit fees and guarantees before recommending a move.",
      "He gave you time to decide.",
    ],
    firm: { name: "Northgate Financial Planning", frn: "538842", phone: "0113 496 0264", website: "northgatefp.co.uk" },
    registerResult: "match",
    pressureLine: null,
    brochure: "statement",
    signDelta: 9000,
  },
  {
    id: "employer-match",
    title: "Free money from the boss",
    kind: "legit",
    openingLine: "Your employer matches? Take every penny, baby. It's free money, and Kenny never says no to free money.",
    product: "Raising the player's workplace pension contributions to get the employer's full matching contribution.",
    talkingPoints: [
      "Many employers match contributions up to a limit.",
      "Not taking the full match is turning down part of your pay.",
      "Contributions also get tax relief.",
      "Check the scheme rules with HR or the pension provider to find the exact match.",
    ],
    redFlags: [],
    whyItHoldsUp: [
      "An employer match is extra money you'd otherwise leave on the table.",
      "Pension contributions get tax relief.",
      "He told you to check the details with your employer.",
    ],
    firm: { name: "Coastline Pensions Advice", frn: "611573", phone: "0117 496 0338", website: "coastlinepensions.co.uk" },
    registerResult: "match",
    pressureLine: null,
    brochure: null,
    signDelta: 14000,
  },
  {
    id: "rainy-day-stash",
    title: "Rainy day stash",
    kind: "legit",
    openingLine: "Before you play, my friend, keep six months in cash. Even Kenny keeps a stash under the boat.",
    product: "Building an emergency fund of three to six months' spending in an easy-access savings account before investing more.",
    talkingPoints: [
      "Life throws surprises: a broken boiler, a gap between jobs.",
      "An emergency fund stops you selling investments at a bad time.",
      "Keep it in an easy-access savings account, ideally one covered by the FSCS.",
      "Three to six months of spending is the usual guide.",
    ],
    redFlags: [],
    whyItHoldsUp: [
      "An emergency fund protects your investments from forced selling.",
      "Easy-access savings with FSCS cover keep it safe and reachable.",
      "Nothing to buy from him, and no rush.",
    ],
    firm: { name: "Bayview Money Coaching", frn: "647109", phone: "020 7946 0186", website: "bayviewmoney.co.uk" },
    registerResult: "match",
    pressureLine: null,
    brochure: null,
    signDelta: 8000,
  },
  {
    id: "dont-grab-lump-sum",
    title: "Don't grab the lump sum",
    kind: "legit",
    openingLine: "Tax-free cash is nice, my friend. Kenny loves cash. But do you actually need it yet?",
    product: "Only taking the 25 percent tax-free lump sum when there is a plan for it, rather than by default.",
    talkingPoints: [
      "You can usually take up to 25 percent of a pension tax-free.",
      "Money taken out stops growing inside the pension.",
      "Cash sitting in a current account can lose value to inflation.",
      "Take it when there's a real use for it, like clearing a mortgage.",
      "Pension Wise offers free, impartial guidance at 50 and over.",
    ],
    redFlags: [],
    whyItHoldsUp: [
      "Leaving money invested can help it keep growing.",
      "He tied the lump sum to a plan, not a spree.",
      "He pointed you to free, impartial guidance.",
    ],
    firm: { name: "Palmer and Reyes Retirement", frn: "529476", phone: "0161 496 0721", website: "palmerreyes.co.uk" },
    registerResult: "match",
    pressureLine: null,
    brochure: "statement",
    signDelta: 11000,
  },
];

export function getPitch(id: string): PitchBrief | undefined {
  return PITCHES.find((p) => p.id === id);
}
