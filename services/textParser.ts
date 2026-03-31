import { BookData, Chapter, Teaching } from '../types';

let cachedData: BookData | null = null;

export const parseText = async (): Promise<BookData> => {
  cachedData = null; // Clear cache to force re-parsing and re-ordering
  const bookData = await import('../SeferHaMiddot.json');
  const chapters: Chapter[] = [];
  const textData = (bookData as any).text;
  const schemaNodes = (bookData as any).schema.nodes;
  
  const titleMap: Record<string, string> = {};
  for (const node of schemaNodes) {
    titleMap[node.enTitle] = node.heTitle;
  }

  const parseTeaching = (s: string, index: number, title: string, partName: string) => {
    const match = s.match(/^\[?([א-ת]{1,3})\s*\.?\]?\s*(.*)/);
    let letter = (index + 1).toString();
    let content = s;
    if (match) {
      letter = match[1];
      content = match[2];
    }
    return {
      id: `${title}-${partName}-${index}`,
      letter,
      content
    };
  };

  for (const [title, content] of Object.entries(textData)) {
    const isIntroduction = title.includes('Introduction');
    const hasParts = !Array.isArray(content);

    const chapter: Chapter = {
      title: titleMap[title] || title,
      part1: [],
      part2: [],
      isIntroduction,
      hasParts
    };

    let part1Raw: string[] = [];
    let part2Raw: string[] = [];

    if (Array.isArray(content)) {
      part1Raw = content;
    } else {
      part1Raw = (content as any)["Part I"] || (content as any)["Part 1"] || [];
      part2Raw = (content as any)["Part II"] || (content as any)["Part 2"] || [];
    }

    chapter.part1 = part1Raw.map((s: string, index: number) => parseTeaching(s, index, title, 'part1'));
    chapter.part2 = part2Raw.map((s: string, index: number) => parseTeaching(s, index, title, 'part2'));

    chapters.push(chapter);
  }

  // Parse new midot from markdown files
  const newMidotFiles = import.meta.glob('../new_midot/*.md', { query: '?raw', import: 'default' });
  for (const path in newMidotFiles) {
    try {
      const content = await newMidotFiles[path]() as string;
      const lines = content.split('\n');
      let title = "";
      const part1: Teaching[] = [];
      const part2: Teaching[] = [];
      let currentPart = part1;
      
      for (const line of lines) {
        if (line.includes('חֵלֶק ב')) {
          currentPart = part2;
          continue;
        }
        const titleMatch = line.match(/### ✨ \*\*פֶּרֶק:\s*(.*?)\s*\*\* ✨/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        } else {
          // Match both **א.** and **א. ...
          const teachingMatch = line.match(/^\*\*([א-ת]{1,3})\.\*?\*?\s*(.*)/);
          if (teachingMatch) {
            currentPart.push({
              id: `new-${title}-${currentPart === part1 ? 'part1' : 'part2'}-${currentPart.length}`,
              letter: teachingMatch[1],
              content: teachingMatch[2],
              author: 'לאון יעקובוב'
            });
          }
        }
      }
      
      if (title && (part1.length > 0 || part2.length > 0)) {
        chapters.push({
          title,
          part1,
          part2,
          isIntroduction: false,
          hasParts: part2.length > 0,
          isNewMida: true
        });
      }
    } catch (e) {
      console.error(`Failed to parse new mida file: ${path}`, e);
    }
  }

  cachedData = { chapters };
  
  console.log('Chapters before reordering:', cachedData.chapters.map(c => c.title));
  
  // Reorder chapters: place "אושר" between "אהבה" and "אמונה", and "כושר" after "כבוד" and before "כעס"
  const osherIndex = cachedData.chapters.findIndex(c => c.title === 'אושר');
  const ahavahIndex = cachedData.chapters.findIndex(c => c.title === 'אהבה');
  
  console.log('Osher index:', osherIndex, 'Ahavah index:', ahavahIndex);
  
  if (osherIndex !== -1 && ahavahIndex !== -1) {
    const osherChapter = cachedData.chapters.splice(osherIndex, 1)[0];
    cachedData.chapters.splice(ahavahIndex + 1, 0, osherChapter);
  }
  
  const kosherIndex = cachedData.chapters.findIndex(c => c.title.includes('כושר') || c.title.includes('כּוֹשֶׁר'));
  const kavodIndex = cachedData.chapters.findIndex(c => c.title === 'כבוד');
  
  console.log('Kosher index:', kosherIndex, 'Kavod index:', kavodIndex);
  
  if (kosherIndex !== -1 && kavodIndex !== -1) {
    const kosherChapter = cachedData.chapters.splice(kosherIndex, 1)[0];
    // Find kavod index again because splice might have changed it
    const newKavodIndex = cachedData.chapters.findIndex(c => c.title === 'כבוד');
    console.log('New Kavod index:', newKavodIndex);
    cachedData.chapters.splice(newKavodIndex + 1, 0, kosherChapter);
  }
  
  const osherWealthIndex = cachedData.chapters.findIndex(c => c.title.includes('עושר') || c.title.includes('עוֹשֶׁר'));
  const anavaIndex = cachedData.chapters.findIndex(c => c.title === 'ענוה');
  
  console.log('OsherWealth index:', osherWealthIndex, 'Anava index:', anavaIndex);
  
  if (osherWealthIndex !== -1 && anavaIndex !== -1) {
    const osherWealthChapter = cachedData.chapters.splice(osherWealthIndex, 1)[0];
    // Find anava index again because splice might have changed it
    const newAnavaIndex = cachedData.chapters.findIndex(c => c.title === 'ענוה');
    console.log('New Anava index:', newAnavaIndex);
    cachedData.chapters.splice(newAnavaIndex, 0, osherWealthChapter);
  }
  
  console.log('Chapters after reordering:', cachedData.chapters.map(c => c.title));

  return cachedData;
};
