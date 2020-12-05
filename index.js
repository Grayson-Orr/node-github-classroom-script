/**
 * @version 0.5.0
 * @author [Grayson Orr](https://github.com/grayson-orr)
 */

// Classroom name - otago-polytechnic-bit-courses

const path = require('path')
const { existsSync, readFile } = require('fs')
const { exec, cp, cd } = require('shelljs')
const { prompt, Separator } = require('inquirer')
const { createDir, fileDirExists } = require('./helper')
const { courseCSVFile } = require('./data.json')
require('colors')

exec('clear')

console.log('GitHub Classroom Script\n'.blue.bold)
console.log(
  "This script allows teachers to clone/pull student assignments from GitHub Classroom. Teachers can also create branches and send student's their assignment feedback.\n"
    .green
)

/**
 * @param {string} myName
 * @param {string} myMsg
 * @param {string} myEmptyMsg
 */
const question = (myName, myMsg, myEmptyMsg) => {
  return {
    type: 'input',
    name: myName,
    message: myMsg,
    validate: val => {
      return val !== '' ? true : myEmptyMsg
    }
  }
}

const initialQuestions = [
  {
    type: 'list',
    name: 'gitCommand',
    message: 'Choose one of the following git commands:',
    choices: [
      'clone',
      'branch',
      'pull',
      new Separator(),
      'student feedback'
    ]
  },
  {
    type: 'input',
    name: 'rosterFilePath',
    message: 'Enter a roster file path:',
    validate: val => {
      return val === ''
        ? 'CSV filename can not be empty. Please enter a CSV filename. For example, <filename>.csv'
            .red.bold
        : !fileDirExists(courseCSVFile, val)
        ? 'CSV filename does not exist. Please enter a CSV filename. For example, <filename>.csv'
            .red.bold
        : true
    }
  },
  question(
    'classroomName',
    'Enter a classroom name:',
    'Please enter a classroom name. For example, otago-polytechnic-bit-courses'
      .red.bold
  ),
  question(
    'assignmentName',
    'Enter an assignment name:',
    'Please enter an assignment name. For example, practicals'.red.bold
  )
]

const studentFeedbackQuestions = question(
  'studentFeedbackDir',
  'Enter a student feedback directory:',
  'Please enter a student feedback directory.'.red.bold
)

const branchQuestion = question(
  'branchName',
  'Enter a branch name:',
  'Please enter a branch name.'.red.bold
)

/**
 * @param {*} myStudentData
 * @param {*} myStudentRepoPath
 * @param {*} myStudentFeedbackDir
 * @param {*} myStudentFeedbackType
 * @param {*} myExtension
 */
const copyFile = (
  myStudentData,
  myStudentRepoPath,
  myStudentFeedbackDir,
  myStudentFeedbackType,
  myExtension
) => {
  myStudentData.forEach(s => {
    const studentDir = `${myStudentRepoPath}-${s}`
    cp(
      `${myStudentFeedbackDir}/${myStudentFeedbackType}-${s}.${myExtension}`,
      studentDir
    )
  })
}

/**
 * @param {*} myStudentData
 * @param {*} myStudentRepoPath
 * @param {*} myRepoCommand
 */
const multipleCommands = (myStudentData, myStudentRepoPath, myRepoCommand) => {
  myStudentData.forEach(s => {
    cd(`${myStudentRepoPath}-${s}`)
    exec(myRepoCommand)
    cd(__dirname) /** Change to the root directory */
  })
}

/**
 * @param {string} myAssignmentName
 * @param {object} myStudentData
 * @param {string} myRepoCommand
 */
const cloneCommand = (myAssignmentName, myStudentData, myRepoCommand) => {
  cd(myAssignmentName)
  myStudentData.forEach(s => {
    existsSync(`${myAssignmentName}-${s}`)
      ? console.log(
          'Repository'.green,
          `${myAssignmentName}-${s}`.blue.bold,
          'already exists'.green
        )
      : console.log(
          'Cloning new repository'.green,
          `${myAssignmentName}-${s}`.blue.bold
        )
    exec(`${myRepoCommand}${s}.git`)
    console.log(
      'Finished cloning new repository'.green,
      `${myAssignmentName}-${s}`.blue.bold
    )
  })
}

prompt(initialQuestions).then(answer => {
  const { gitCommand, rosterFilePath, classroomName, assignmentName } = answer
  readFile(path.join('csv', rosterFilePath), (err, data) => {
    const studentData = data
      .toString()
      .split('\n')
      .map(s => s.toLowerCase())
    const studentRepoPath = `${assignmentName}/${assignmentName}`
    switch (gitCommand) {
      case 'clone':
        createDir(assignmentName)
        repoCommand = `git clone -q https://github.com/${classroomName}/${assignmentName}-`
        cloneCommand(assignmentName, studentData, repoCommand)
        break
      case 'branch':
        prompt(branchQuestion).then(bAnswer => {
          const { branchName } = bAnswer
          repoCommand = `git checkout master; git branch -D ${branchName}; git checkout -q -b ${branchName}; git rm -rf .; git push -f`
          multipleCommands(studentData, studentRepoPath, repoCommand)
        })
        break
      case 'pull':
        repoCommand = 'git checkout -q master; git pull origin master'
        multipleCommands(studentData, studentRepoPath, repoCommand)
        break
      case 'student feedback':
        prompt(branchQuestion).then(bAnswer => {
          prompt(studentFeedbackQuestions).then(fbAnswer => {
            const { branchName } = bAnswer
            const { studentFeedbackDir } = fbAnswer
            repoCommand = `git checkout -q ${branchName}; git pull origin ${branchName}; git add .; git commit -m "Add student feedback"; git push`
            copyFile(
              studentData,
              studentRepoPath,
              studentFeedbackDir,
              'results',
              'pdf'
            )
            multipleCommands(studentData, studentRepoPath, repoCommand)
          })
        })
        break
    }
  })
})
