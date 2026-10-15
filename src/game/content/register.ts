import type { RegisterEntry } from "../types";

/**
 * The fictional FCA register on Kenny's desk. Pure data: the register never lies.
 *
 * It must agree with each pitch's registerResult:
 * - "match": the FRN is here and phone and website match what Kenny says.
 * - "clone": the FRN is here, but Kenny's phone or website differ.
 * - "not_listed": the FRN is not here.
 *
 * Before showing the game outside the offsite, check none of these FRNs, names
 * or websites belong to real firms.
 */
export const REGISTER: RegisterEntry[] = [
  { frn: "538842", name: "Northgate Financial Planning", status: "Authorised", phone: "0113 496 0264", website: "northgatefp.co.uk", address: "4 Wharf Street, Leeds" },
  { frn: "611573", name: "Coastline Pensions Advice", status: "Authorised", phone: "0117 496 0338", website: "coastlinepensions.co.uk", address: "21 Harbour Row, Bristol" },
  { frn: "647109", name: "Bayview Money Coaching", status: "Authorised", phone: "020 7946 0186", website: "bayviewmoney.co.uk", address: "9 Canal Yard, London" },
  { frn: "529476", name: "Palmer and Reyes Retirement", status: "Authorised", phone: "0161 496 0721", website: "palmerreyes.co.uk", address: "77 Mill Lane, Manchester" },
  {
    frn: "702918",
    name: "Harbourside Wealth Management",
    status: "Authorised",
    phone: "020 7946 0508",
    website: "harbourside-wealth.co.uk",
    address: "2 Quay Place, London",
    warning: "Clone firm alert: fraudsters are using this firm's name and number with different contact details.",
  },
  // Distractors, so the register isn't just the answer key.
  { frn: "553018", name: "Meridian Annuity Services", status: "No longer authorised", phone: "0113 496 0905", website: "meridianannuity.co.uk", address: "15 Park Square, Leeds" },
  { frn: "690244", name: "Silverline Investment Partners", status: "Authorised", phone: "020 7946 0377", website: "silverlineip.co.uk", address: "40 Bank Street, London" },
];
