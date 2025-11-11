import { Course } from '../types';
import { generateId } from './auth';

const COURSES_KEY = 'materiaParaVoce_courses';

const createDefaultCourses = (): Course[] => {
    const fileContent = `PRESENT PERFECT

POSITIVE
I + HAVE + PAST PARTICIPLE (3a coluna)
SHE/HE + HAS + PAST PARTICIPLE

NEGATIVE
I + HAVEN'T/HAVE NOT + PAST PARTICIPLE (3a coluna)
SHE/HE + HASN'T/HAS NOT + PAST PARTICIPLE

INTERROGATIVE
HAVE + YOU + PAST PARTICIPLE + ? (3a coluna)
HAS + SHE/HE + PAST PARTICIPLE + ?

O simple present usamos para expressar acoes ou situacoes que comecaram no passado e continuam no prsente ou que tem uma consequencia no presente.

---

PRESENT PERFECT X SIMPLE PAST

SIMPLE PAST
THE SIMPLE PAST IS A FINISHED PAST FORM
EXAMPLE:
I ATE PASTA YESTERDAY
HE WASHED THE CAR TWO WEEKS AGO

PRESENT PERFECT
THE PRESENT PERFECT IS A PAST FORM THAT STARTED IN THE PAST AND CONTINUED IN THE FUTURE OR IT HAS A FUTURE CONSEQUENCE
EXAMPLE:
I HAVE MET ANA YESTERDAY
HE HAS EATEN BREAD TWO DAYS AGO`;
    
    const base64Content = btoa(fileContent);

    const inglesCourse: Course = {
        id: generateId(),
        title: 'Inglês',
        teacher: 'Raphael Costa',
        teacherId: 'rapha-admin-id',
        icon: 'AcademicCapIcon',
        imageUrl: 'https://images.pexels.com/photos/209905/pexels-photo-209905.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'Não iniciado',
        progress: 0,
        classrooms: [],
        years: [],
        content: [
            {
                id: generateId(),
                title: '2025',
                illustrationUrl: 'https://images.pexels.com/photos/276267/pexels-photo-276267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                classrooms: [],
                years: [],
                categories: [
                    {
                        id: generateId(),
                        title: 'Roteiro de Estudos',
                        illustrationUrl: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                        classrooms: [],
                        years: [],
                        materials: [
                            {
                                id: generateId(),
                                title: 'Estudo para PT - Ing - 3 tri - 2025',
                                type: 'file',
                                content: `data:text/plain;base64,${base64Content}`,
                                fileName: 'Estudo_PT_Ing_3_tri_2025.txt',
                                fileType: 'text/plain',
                                classrooms: [],
                                years: [],
                            }
                        ]
                    }
                ]
            }
        ]
    };
    return [inglesCourse];
};


export const getCourses = (): Course[] => {
  try {
    const coursesJson = localStorage.getItem(COURSES_KEY);
    // If no courses in localStorage, create default ones.
    if (!coursesJson) {
      const defaultCourses = createDefaultCourses();
      saveCourses(defaultCourses);
      return defaultCourses;
    }
    return JSON.parse(coursesJson);
  } catch (error) {
    console.error("Failed to parse courses from localStorage", error);
    // If data is corrupted, clear it and start fresh with defaults.
    localStorage.removeItem(COURSES_KEY);
    const defaultCourses = createDefaultCourses();
    saveCourses(defaultCourses);
    return defaultCourses;
  }
};

export const saveCourses = (courses: Course[]): void => {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || (e.code && (e.code === 22 || e.code === 1014))) {
      throw new Error('fileTooLargeError');
    }
    throw new Error('fileProcessingError');
  }
};