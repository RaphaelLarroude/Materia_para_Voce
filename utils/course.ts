import { Course } from '../types';
import { generateId } from './auth';

const createDefaultCourses = (): Course[] => {
    const inglesCourse: Course = {
        id: generateId(),
        title: 'Inglês',
        teacher: 'Raphael Costa',
        teacherId: 'rapha-admin-id',
        icon: 'AcademicCapIcon',
        imageUrl: 'https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'Não iniciado',
        progress: 0,
        classrooms: [],
        years: [],
        content: [
            {
                id: generateId(),
                title: '2025',
                illustrationUrl: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
                                type: 'link',
                                content: "https://1drv.ms/b/c/99af5b4d952510d4/Ec9mU8BRqENJswpLfoTByh8BbBbYza7mBJh-_yAHwl-AVQ?e=1lPvUZ",
                                classrooms: [],
                                years: [],
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const matematicaCourse: Course = {
        id: generateId(),
        title: 'Matemática',
        teacher: 'Raphael Costa',
        teacherId: 'rapha-admin-id',
        icon: 'BeakerIcon',
        imageUrl: 'https://images.pexels.com/photos/374918/pexels-photo-374918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'Não iniciado',
        progress: 0,
        classrooms: [],
        years: [],
        content: [
            {
                id: generateId(),
                title: '2025',
                illustrationUrl: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                classrooms: [],
                years: [],
                categories: [
                    {
                        id: generateId(),
                        title: 'Roteiro de Estudos',
                        illustrationUrl: 'https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                        classrooms: [],
                        years: [],
                        materials: [
                            {
                                id: generateId(),
                                title: 'Estudo para PT - Mat - 3 tri - 2025',
                                type: 'link',
                                content: "https://1drv.ms/b/c/99af5b4d952510d4/Eas_a2CFnhFMtFRiPlx5-tIB7G4AQ4LnHbUGb24xGTLe9Q?e=TbFaKq",
                                classrooms: [],
                                years: [],
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return [inglesCourse, matematicaCourse];
};


// In-memory storage
let storedCourses: Course[] = createDefaultCourses();

export const getCourses = (): Course[] => {
    return storedCourses;
};

export const saveCourses = (courses: Course[]): void => {
    storedCourses = courses;
};