import elementToString from "./elementToString";
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
    const bitsAllocated = dataSet.uint16("x00280100");
    vr = bitsAllocated === 8 ? "OB" : "OW";
  }

  if (vr === "US|SS") {
    const pixelRepresentation = dataSet.uint16("x00280103");
    vr = pixelRepresentation === 0 ? "US" : "SS";
  }

  return vr;
}

export function dataSetToTree(dataSet, dictionary) {
  if (dataSet === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dataSet";
  }

  if (dictionary === undefined) {
    throw "dicomParser.dataSetToTree: missing required parameter: dictionary";
  }

  const result = [];

  const keys = [];
  for (let propertyName in dataSet.elements) {
    keys.push(propertyName);
  }
  keys.sort();

  for (let k = 0; k < keys.length; k++) {
    var propertyName = keys[k];
    var element = dataSet.elements[propertyName];

    const tagDefinition = lookupDicomTag(element.tag, dictionary);

    const tagInfo = {
      tag: punctuateTag(element.tag),
      vr: getElementVR(dataSet, element, tagDefinition),
      name: tagDefinition?.name || "Unknown Element",
    };

    if (element.items) {
      tagInfo.children = element.items.map((item, index) => ({
        tag: punctuateTag(item.tag),
        name: `Item #${index}`,
        children: dataSetToTree(item.dataSet, dictionary),
      }));
    } else if (tagInfo.vr) {
      tagInfo.value = elementToString(dataSet, element, tagInfo.vr);
    }

    result.push(tagInfo);
  }

  return result;
}
