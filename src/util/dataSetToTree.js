import elementToString from "./elementToString";
import { lookupDicomTag, punctuateTag } from "./util";

export default function datasetToTree(dataSet, dictionary) {
  const result = [];

  const keys = [];
  for (let propertyName in dataSet.elements) {
    keys.push(propertyName);
  }
  keys.sort();

  for (let k = 0; k < keys.length; k++) {
    var propertyName = keys[k];
    var element = dataSet.elements[propertyName];

    const tagDefinition = lookupDicomTag(element.tag);

    const tagInfo = {
      tag: punctuateTag(element.tag),
      vr: element.vr || tagDefinition?.vr,
      name: tagDefinition?.name || "Unknown Element",
    };

    if (element.items) {
      tagInfo.children = element.items.map((item, index) => ({
        tag: punctuateTag(item.tag),
        name: `Item #${index}`,
        children: datasetToTree(item.dataSet, dictionary),
      }));
    } else if (tagInfo.vr) {
      tagInfo.value = elementToString(dataSet, element, tagInfo.vr);
    }

    result.push(tagInfo);
  }

  return result;
}
