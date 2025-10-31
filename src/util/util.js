// https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_6.2
const stringVrs = {
  AE: true,
  AS: true,
  AT: false,
  CS: true,
  DA: true,
  DS: true,
  DT: true,
  FL: false,
  FD: false,
  IS: true,
  LO: true,
  LT: true,
  OB: false,
  OD: false,
  OF: false,
  OL: false,
  OV: false,
  OW: false,
  PN: true,
  SH: true,
  SL: false,
  SQ: false,
  SS: false,
  ST: true,
  SV: false,
  TM: true,
  UC: true,
  UI: true,
  UL: false,
  UN: undefined, // dunno
  UR: true,
  US: false,
  UT: true,
  UV: false,
};

/**
 * Tests to see if vr is a string or not.
 * @param vr
 * @returns true if string, false it not string, undefined if unknown vr or UN type
 */
const isStringVr = (vr) => stringVrs[vr];

/**
 * Tests to see if a given tag in the format xggggeeee is a private tag or not
 * @param tag
 * @returns {boolean}
 * @throws error if fourth character cannot be parsed
 */
const isPrivateTag = (tag) => {
  const lastGroupDigit = parseInt(tag[4], 16);
  if (isNaN(lastGroupDigit)) {
    throw "dicomParser.isPrivateTag: cannot parse last character of group";
  }
  const groupIsOdd = lastGroupDigit % 2 === 1;

  return groupIsOdd;
};

/**
 * Parses a DICOM tag string (e.g., 'x7fe00010' or '7fe00010') into group and element.
 * @param {string} tag - The DICOM tag in string form.
 * @returns group and element: Uppercase 4-digit hex strings.
 */
function parseTag(tag) {
  const match = tag.match(/^x?([0-9a-fA-F]{4})([0-9a-fA-F]{4})$/);
  if (!match) {
    throw new Error(`Invalid DICOM tag format: ${tag}`);
  }
  return {
    group: match[1].toUpperCase(),
    element: match[2].toUpperCase(),
  };
}

/**
 * Converts a compact DICOM tag (e.g., "x00100010") into a standard DICOM tag format (e.g., "(0010,0010)").
 * @param {string} tag - The compact DICOM tag string, expected in the form "xggggeeee",
 *                       where "gggg" and "eeee" are hexadecimal digits.
 * @returns {string} The punctuated DICOM tag in standard format, "(gggg,eeee)".
 */
function punctuateTag(tag) {
  if (typeof tag !== "string") {
    throw new Error("Input must be a string.");
  }

  if (tag.includes(",")) {
    return tag;
  }

  if (tag.length !== 9 || tag[0] !== "x") {
    throw new Error(
      `Invalid compact DICOM tag format: "${tag}". Expected "xggggeeee" style.`
    );
  }

  const hexPart = tag.substring(1);
  if (!/^[0-9a-fA-F]{8}$/.test(hexPart)) {
    throw new Error(`Invalid hex in DICOM tag: "${tag}"`);
  }

  const { group, element } = parseTag(tag);
  return `(${group},${element})`;
}

/**
 * 根据 DICOM 标签查找字典定义，支持多种通配符回退策略。
 * @param {string} tag - DICOM 标签，如 '00100010' 或 '(0010,0010)'
 * @param {Object} dictionary - DICOM 数据字典
 * @returns {Object|undefined}
 */
function lookupDicomTag(tag, dictionary) {
    const exactTag = punctuateTag(tag); 
    const { group, element } = parseTag(tag);

    // 1. 精确匹配
    if (dictionary[exactTag]) {
        return dictionary[exactTag];
    }

    // 2. 组通配: (ggxx,eeee)
    const groupWildcard = `(${group.substring(0, 2)}xx,${element})`;
    if (dictionary[groupWildcard]) {
        return { ...dictionary[groupWildcard], tag: exactTag };
    }

    // 3. 元素后缀通配: (gggg,xxxe) — 保留 element 最后一位
    const elementLastChar = element.charAt(3);
    const elementSuffixWildcard = `(${group},xxx${elementLastChar})`;
    if (dictionary[elementSuffixWildcard]) {
        return { ...dictionary[elementSuffixWildcard], tag: exactTag };
    }

    // 4. 元素全通配: (gggg,xxxx)
    const elementFullWildcard = `(${group},xxxx)`;
    if (dictionary[elementFullWildcard]) {
        return { ...dictionary[elementFullWildcard], tag: exactTag };
    }

    return undefined;
}

export { isStringVr, isPrivateTag, parseTag, punctuateTag, lookupDicomTag };
