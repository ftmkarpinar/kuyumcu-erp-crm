import tr_tr from './translation/tr_tr';

const getLabel = (key) => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    if (tr_tr[lowerCaseKey]) return tr_tr[lowerCaseKey];

    // Çeviri bulunamazsa key'i okunabilir hale getir
    const remove_underscore_fromKey = key.replace(/_/g, ' ').split(' ');
    const conversionOfAllFirstCharacterofEachWord = remove_underscore_fromKey.map(
      (word) => word[0].toUpperCase() + word.substring(1)
    );
    return conversionOfAllFirstCharacterofEachWord.join(' ');
  } catch (error) {
    return key;
  }
};

const useLanguage = () => {
  const translate = (value) => getLabel(value);
  return translate;
};

export default useLanguage;
