/**
 * Intelligent gender detection and photo selector for campus student/faculty avatars
 * "if name is girl then show the girl photo otherwise boy if boy name default"
 */

const GIRL_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80',
];

const BOY_PHOTOS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
];

const FEMALE_NAMES = new Set([
  'preeti', 'priya', 'ananya', 'sneha', 'neha', 'tanvi', 'pooja', 'riya', 'aditi',
  'kavya', 'shreya', 'divya', 'meera', 'deepika', 'natasha', 'sunita', 'ishita',
  'anjali', 'ritu', 'anita', 'simran', 'aarti', 'muskan', 'swati', 'sakshi', 'khushi',
  'tanya', 'komal', 'pallavi', 'rashmi', 'nisha', 'rekha', 'geeta', 'payal', 'mansi',
  'jyoti', 'sonia', 'vandana', 'bhavna', 'monika', 'radhika', 'akanksha', 'aishwarya',
  'madhuri', 'anushka', 'kriti', 'kiara', 'parineeti', 'shruti', 'sonam', 'vidya',
  'kajol', 'rani', 'juhi', 'urvashi', 'alia', 'sarah', 'emma', 'olivia', 'sophia',
  'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn', 'abigail', 'emily',
  'elizabeth', 'mila', 'ella', 'avery', 'sofia', 'camila', 'aria', 'scarlett',
  'victoria', 'madison', 'luna', 'grace', 'chloe', 'penelope', 'layla', 'riley',
  'zoey', 'nora', 'lily', 'eleanor', 'hannah', 'lillian', 'addison', 'aubrey',
  'ellie', 'stella', 'natalie', 'zoe', 'leah', 'hazel', 'violet', 'aurora', 'savannah',
  'audrey', 'brooklyn', 'bella', 'claire', 'skylar', 'lucy', 'paisley', 'everly',
  'anna', 'caroline', 'nova', 'genesis', 'emilia', 'kennedy', 'samantha', 'maya',
  'willow', 'kinsley', 'naomi', 'aaliyah', 'elena', 'ariana', 'allison', 'gabriella',
  'alice', 'madelyn', 'cora', 'ruby', 'eva', 'serenity', 'autumn', 'adeline', 'hailey',
  'gianna', 'valentina', 'isla', 'eliana', 'quinn', 'ivy', 'sadie', 'piper', 'lydia',
  'alexa', 'josephine', 'emery', 'delilah', 'arianna', 'vivian', 'kaylee', 'sophie',
  'brielle', 'madeline', 'clara', 'hadley', 'melanie', 'mackenzie', 'sita', 'gita',
  'parvati', 'lakshmi', 'saraswati', 'durga', 'bhavani', 'tara', 'usha', 'suman',
  'sunaina', 'namrata', 'archana', 'sheetal', 'roshni', 'bhumika', 'garima', 'prerna',
]);

// Explicit exceptions for male names that might end in typically female suffixes (e.g. 'a')
const MALE_NAMES_WITH_A_SUFFIX = new Set([
  'krishna', 'surya', 'shiva', 'rana', 'arya', 'aditya', 'sharma', 'chandra', 'rama',
  'rudra', 'indra', 'bala', 'dara', 'mustafa', 'murtaza', 'hamza', 'reza', 'issa',
]);

/**
 * Checks if a given full name or first name belongs to a girl/female
 */
export function isGirlName(fullName: string): boolean {
  if (!fullName) return false;

  // Clean and extract the first name token (ignoring titles like Dr., Prof., Mr., Ms., etc.)
  const clean = fullName
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, '')
    .trim()
    .toLowerCase();

  const firstName = clean.split(/[\s_.-]+/)[0] || '';
  if (!firstName) return false;

  // Direct set lookup
  if (FEMALE_NAMES.has(firstName)) {
    return true;
  }

  // Male exceptions
  if (MALE_NAMES_WITH_A_SUFFIX.has(firstName)) {
    return false;
  }

  // Common feminine name endings in Indian languages
  if (
    firstName.endsWith('i') ||
    firstName.endsWith('ee') ||
    firstName.endsWith('ya') ||
    firstName.endsWith('ika') ||
    firstName.endsWith('ti') ||
    firstName.endsWith('ina')
  ) {
    return true;
  }

  // Default to false (boy)
  return false;
}

/**
 * Returns a high-quality girl photo if the name is female,
 * otherwise returns a boy photo (boy is default).
 */
export function getAvatarForName(name: string): string {
  // Deterministic photo hash based on character codes so the user's avatar remains stable
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  if (isGirlName(name)) {
    return GIRL_PHOTOS[index % GIRL_PHOTOS.length];
  }

  // Default is boy photo
  return BOY_PHOTOS[index % BOY_PHOTOS.length];
}
