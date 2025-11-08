import elementToString from "./elementToString";
import elementToValue from "./elementToValue";
import { lookupDicomTag, punctuateTag } from "./util";

function getElementVR(dataSet, element, tagDefinition) {
  if (element.vr) {
    return element.vr;
  }

  if (!tagDefinition || tagDefinition.vr === undefined) {
    return undefined;
  }

  let vr = tagDefinition.vr;

  if (vr === "OB|OW") {
    // Pixel Data (7FE0,0010): OB for encapsulated, OB|OW for uncompressed
    if (element.tag == "x7fe00010" && element.encapsulatedPixelData) {
      vr = "OB";
    } else {
      const bitsAllocated = dataSet.uint16("x00280100") ?? 8;
      vr = bitsAllocated === 8 ? "OB" : "OW";
    }
  }

  if (vr === "US|SS") {
    const pixelRepresentation = dataSet.uint16("x00280103") ?? 0;
    vr = pixelRepresentation === 0 ? "US" : "SS";
  }

  return vr;
}

export function dataSetToTree(dataSet, dictionary, parentKey = '') {
  if (dataSet === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dataSet";
  }

  if (dictionary === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dictionary";
  }

  const result = [];

  const keys = Object.keys(dataSet.elements);
  keys.sort();

  keys.forEach((key) => {
    const element = dataSet.elements[key];
    const tagDefinition = lookupDicomTag(element.tag, dictionary);

    const tagInfo = {
      key: `${parentKey}${element.tag}`,
      tag: punctuateTag(element.tag),
      vr: getElementVR(dataSet, element, tagDefinition),
      name: tagDefinition?.name || "Unknown Element",
    };

    if (element.items) {
      tagInfo.children = element.items.map((item, index) => ({
        key: `${tagInfo.key}[${index}]`,
        tag: punctuateTag(item.tag),
        name: `Item #${index}`,
        children: dataSetToTree(item.dataSet, dictionary, `${tagInfo.key}[${index}]`),
      }));
    } else if (tagInfo.vr) {
      tagInfo.value = elementToString(dataSet, element, tagInfo.vr);
    }

    result.push(tagInfo);
  });

  return result;
}

export function dataSetToJson(dataSet, dictionary) {
  if (dataSet === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dataSet";
  }

  if (dictionary === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dictionary";
  }

  const dicomObj = {};

  Object.keys(dataSet.elements).forEach((key) => {
    const element = dataSet.elements[key];
    const tagDefinition = lookupDicomTag(element.tag, dictionary);

    if (!tagDefinition || !tagDefinition.name) {
      return;
    }

    if (
      element.tag === "xfffee000" ||
      element.tag === "xfffee00d" ||
      element.tag === "xfffee0dd"
    ) {
      return;
    }

    const propertyName = tagDefinition.name;
    if (element.items) {
      dicomObj[propertyName] = element.items.map((item) =>
        dataSetToJson(item.dataSet, dictionary)
      );
    } else {
      dicomObj[propertyName] = elementToValue(
        dataSet,
        element,
        tagDefinition.vr
      );
    }
  });

  return dicomObj;
}
