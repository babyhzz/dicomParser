/**
 * Parses a DICOM tag string (e.g., 'x7fe00010' or '7fe00010') into group and element.
 * @param {string} tag - The DICOM tag in string form.
 * @returns group and element: Uppercase 4-digit hex strings.
 */
function parseDicomTag(tag) {
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
 * @param {string} tag - The compact DICOM tag string, expected in the form "xggggeeee", where "gggg" and "eeee" are hexadecimal digits.
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
    throw new Error(`Invalid compact DICOM tag format: "${tag}". Expected "xggggeeee" style.`);
  }

  const hexPart = tag.substring(1);
  if (!/^[0-9a-fA-F]{8}$/.test(hexPart)) {
    throw new Error(`Invalid hex in DICOM tag: "${tag}"`);
  }

  const { group, element } = parseDicomTag(tag);
  return `(${group},${element})`;
}
