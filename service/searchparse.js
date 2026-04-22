const countryMap = {
  nigeria: "NG",
  kenya: "KE",
  ghana: "GH",
  ethiopia: "ET",
  tanzania: "TZ",
  uganda: "UG",
  southafrica: "ZA",
  egypt: "EG",
  morocco: "MA",
  angola: "AO",
  mozambique: "MZ",
  zambia: "ZM",
  zimbabwe: "ZW",
  senegal: "SN",
  mali: "ML",
  cameroon: "CM",
  ivory: "CI",
  rwanda: "RW",
  madagascar: "MG",
  somalia: "SO",
  sudan: "SD",
  algeria: "DZ",
  tunisia: "TN",
  libya: "LY",
  burundi: "BI",
  malawi: "MW",
  namibia: "NA",
  botswana: "BW",
  benin: "BJ",
  togo: "TG",
  niger: "NE",
  guinea: "GN",
  chad: "TD",
  congo: "CG",
  gabon: "GA",
  eritrea: "ER",
  lesotho: "LS",
  gambia: "GM",
  liberia: "LR",
  sierra: "SL",
  djibouti: "DJ",
  comoros: "KM",
  seychelles: "SC",
  mauritius: "MU",
  mauritania: "MR",
  eswatini: "SZ",
  france: "FR",
  germany: "DE",
  uk: "GB",
  britain: "GB",
  india: "IN",
  china: "CN",
  japan: "JP",
  brazil: "BR",
  canada: "CA",
  australia: "AU",
  usa: "US",
  america: "US",
};

export const parseSearch = (q) => {
  const text = q.toLowerCase().trim();
  const words = text.split(/\s+/);
  const filter = {};

  //   gender

  if (words.includes("male") && !words.includes("female")) {
    filter.gender = "male";
  } else if (words.includes("female")) {
    filter.gender = "female";
  } else if (words.includes("males") && !words.includes("females")) {
    filter.gender = "male";
  } else if (words.includes("females")) {
    filter.gender = "female";
  }

  // age age_group
  if (words.includes("child") || words.includes("children")) {
    filter.age_group = "child";
  } else if (words.includes("teenager") || words.includes("teenagers")) {
    filter.age_group = "teenager";
  } else if (words.includes("adult") || words.includes("adults")) {
    filter.age_group = "adult";
  } else if (words.includes("senior") || words.includes("seniors")) {
    filter.age_group = "senior";
  }

  // young

  if (words.includes("young")) {
    filter.age = { $gte: 16, $lte: 24 };
  }

  // older than

  const aboveIndex = words.indexOf("above");
  const olderIndex = words.indexOf("older");
  if (aboveIndex !== -1 && words[aboveIndex + 1]) {
    const num = Number(words[aboveIndex + 1]);
    if (!isNaN(num)) filter.age = { ...filter.age, $gte: num };
  } else if (olderIndex !== -1 && words[olderIndex + 2]) {
    const num = Number(words[olderIndex + 2]);
    if (!isNaN(num)) filter.age = { ...filter.age, $gte: num };
  }

  // --- BELOW / YOUNGER THAN ---
  const belowIndex = words.indexOf("below");
  const youngerIndex = words.indexOf("younger");
  if (belowIndex !== -1 && words[belowIndex + 1]) {
    const num = Number(words[belowIndex + 1]);
    if (!isNaN(num)) filter.age = { ...filter.age, $lte: num };
  } else if (youngerIndex !== -1 && words[youngerIndex + 2]) {
    const num = Number(words[youngerIndex + 2]);
    if (!isNaN(num)) filter.age = { ...filter.age, $lte: num };
  }

  // countery

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (countryMap[clean]) {
      filter.country_id = countryMap[clean];
      break;
    }
  }

  //check if you understand

  if (Object.keys(filter).length === 0) {
    return null;
  }
  return filter;
};
