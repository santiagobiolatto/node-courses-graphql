const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const _ = require('lodash');
const {
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} = require("graphql");

const courses = require('./courses.json');
const students = require('./students.json');
const grades = require('./grades.json');

const CourseType = new GraphQLObjectType({
    name: 'course',
    description: 'Represent courses',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)}
    })
});


const StudentType = new GraphQLObjectType({
    name: 'students',
    description: 'Represent students',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        lastName: {type: GraphQLNonNull(GraphQLString)},
        courseId:{type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (student) =>{
                return courses.find(course => course.id === student.courseId);
            }
        }
    })
});

const GradeType = new GraphQLObjectType({
    name: 'grades',
    description: 'Represent grades',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        studentId: {type: GraphQLNonNull(GraphQLInt)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (grade) =>{
                return courses.find(course => course.id === grade.courseId);
            }
        },
        student: {
            type: StudentType,
            resolve: (grade) =>{
                return students.find(student => student.id === grade.studentId);
            }
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addStudent: {
            type: StudentType,
            description: 'Add a student',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                lastName: {type: GraphQLNonNull(GraphQLString)},
                courseId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const student = {
                    id: students.length + 1,
                    name: args.name,
                    lastName: args.lastName,
                    courseId: args.courseId
                }
            students.push(student);
            return student;
            }
        },
        addCourse: {
            type: CourseType,
            description: 'Add a course',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const course = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                }
            courses.push(course);
            return course;
            }
        },
        addGrades: {
            type: GradeType,
            description: 'Add a grade',
            args: {
                courseId: {type: GraphQLNonNull(GraphQLInt)},
                studentId: {type: GraphQLNonNull(GraphQLInt)},
                grade: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const grade = {
                    id: grades.length + 1,
                    courseId: args.courseId,
                    studentId: args.studentId,
                    grade: args.grade
                }
            grades.push(grade);
            return grade;
            }
        },
        deleteStudent: {
            type: StudentType,
            description: 'Delete a student',
            args: {
                id:{type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(students, (student)=>{
                    return student.id === args.id;
                });
            }
        },
        deleteCourse: {
            type: CourseType,
            description: 'Delete a course',
            args: {
                id:{type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(courses, (course)=>{
                    return course.id === args.id;
                });
            }
        },
        deleteGrade: {
            type: GradeType,
            description: 'Delete a grade',
            args: {
                id:{type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(grades, (grade)=>{
                    return grade.id === args.id;
                });
            }
        }
    }),
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        students: {
            type: new GraphQLList(StudentType),
            description: 'List of all students',
            resolve: () => students
        },
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of all courses',
            resolve: () => courses
        },
        grades: {
            type: new GraphQLList(GradeType),
            description: 'List of grades',
            resolve: () => grades
        },
        student:{
            type: StudentType,
            description: 'Particular student',
            args:{
                id: {type:GraphQLInt}
            },
            resolve:(parent, args) => students.find(student => student.id === args.id)
        },
        course:{
            type: CourseType,
            description: 'Particular course',
            args:{
                id: {type:GraphQLInt}
            },
            resolve:(parent, args) => courses.find(course => course.id === args.id)
        },
        grade:{
            type: GradeType,
            description: 'Particular grade',
            args:{
                id: {type:GraphQLInt}
            },
            resolve:(parent, args) => grades.find(grade => grade.id === args.id)
        }
    }),
});


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({  //Levanto interfaz de graphql
    schema: schema,
    graphiql: true
}));

app.listen(3000, () =>{         //Levanto server
    console.log('server runing');
    
});