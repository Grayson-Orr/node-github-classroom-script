/**
 * @version 1
 * @author [Grayson Orr](https://github.com/grayson-orr)
 * @date 5th August 2019
 */

// Classroom name - otago-polytechnic-bit-courses

const { existsSync, mkdirSync, readFile } = require('fs')
const { exec, cp, cd } = require('shelljs')
const { prompt } = require('inquirer')
require('colors')

exec('clear')

console.log('GitHub Classroom Script\n'.blue.bold)
console.log('This script allows teachers to clone/pull student assignments from GitHub Classroom. Teachers can also create branches and send students assignment feedback.\n'.green)

const questions = [
  {
    type: 'list',
    name: 'gitCommand',
    message: 'Choose one of the following git commands:',
    choices: ['clone', 'branch', 'pull', 'student feedback']
  },
  {
    type: 'input',
    name: 'rosterFilePath',
    message: 'Enter a roster file path:',
    validate: val => {
      return val !== '' ? true
        : 'Please enter a roster file path. For example, <file path>.csv'
    }
  },
  {
    type: 'input',
    name: 'classroomName',
    message: 'Enter a classroom name:',
    validate: val => {
      return val !== '' ? true 
        : 'Please enter a classroom name. For example, otago-polytechnic-bit-courses'
    }
  },
  {
    type: 'input',
    name: 'assignmentName',
    message: 'Enter an assignment name:',
    validate: val => {
      return val !== '' ? true
        : 'Please enter an assignment name. For example, practicals'
    }
  }
]

const branchQuestion = [
  {
    type: 'input',
    name: 'branchName',
    message: 'Enter a branch name:',
    validate: val => {
      return val !== '' ? true : 'Please enter a branch name.'
    }
  }
]

const studentFeedbackQuestions = [
  {
    type: 'input',
    name: 'studentFeedbackDir',
    message: 'Enter a student feedback directory:',
    validate: val => {
      return val !== '' ? true : 'Please enter a student feedback directory.'
    }
  }
]

const createDir = myDir => {
  try {
    if (!existsSync(myDir)) {
      console.log('Creating new directory'.green, myDir.blue.bold)
      mkdirSync(myDir)
      console.log('Finished creating new directory'.green, myDir.blue.bold)
    }
  } catch (err) {
    console.error(err)
  }
}

const copyFile = (myStudentData, myStudentRepoPath, myStudentFeedbackDir,
  myStudentFeedbackType, myExtension) => {
  myStudentData.forEach(s => {
    const studentDir = `${myStudentRepoPath}-${s}`
    cp(`${myStudentFeedbackDir}/${myStudentFeedbackType}-${s}.${myExtension}`, studentDir)
  })
}

const multipleCommands = (myStudentData, myStudentRepoPath, myRepoCommand) => {
  myStudentData.forEach(s => {
    cd(`${myStudentRepoPath}-${s}`)
    exec(myRepoCommand)
    cd(__dirname) /** Change to the root directory */ 
  })
}

const cloneCommand = (myAssignmentName, myStudentData, myRepoCommand) => {
  cd(myAssignmentName)
  myStudentData.forEach(s => {
    existsSync(`${myAssignmentName}-${s}`)
      ? console.log('Repository'.green, `${myAssignmentName}-${s}`.blue.bold, 'already exists'.green)
      : console.log('Cloning new repository'.green, `${myAssignmentName}-${s}`.blue.bold)
    exec(`${myRepoCommand}${s}.git`)
    console.log('Finished cloning new repository'.green, `${myAssignmentName}-${s}`.blue.bold)
  })
}

prompt(questions).then(answer => {
  const { gitCommand, rosterFilePath, classroomName, assignmentName } = answer
  readFile(rosterFilePath, (err, data) => {
    const studentData = data
      .toString()
      .split('\n')
      .map(s => s.toLowerCase())
    const studentRepoPath = `${assignmentName}/${assignmentName}`
    if (err) console.log(err)
    else {
      let repoCommand
      if (gitCommand === 'clone') {
        createDir(assignmentName)
        repoCommand = `git clone -q https://github.com/${classroomName}/${assignmentName}-`
        cloneCommand(assignmentName, studentData, repoCommand)
      } else if (gitCommand === 'branch') {
        prompt(branchQuestion).then(bAnswer => {
          const { branchName } = bAnswer
          repoCommand = `git checkout master; git branch -D ${branchName}; git checkout -q -b ${branchName}; git rm -rf .; git push -f`
          multipleCommands(studentData, studentRepoPath, repoCommand)
        })
      } else if (gitCommand === 'student feedback') {
        prompt(branchQuestion).then(bAnswer => {
          prompt(studentFeedbackQuestions).then(fbAnswer => {
            const { branchName } = bAnswer
            const { studentFeedbackDir } = fbAnswer
            repoCommand = `git checkout -q ${branchName}; git pull origin ${branchName}; git add .; git commit -m "Add student feedback"; git push`
            copyFile(studentData, studentRepoPath, studentFeedbackDir, 'final-results', 'pdf')
            multipleCommands(studentData, studentRepoPath, repoCommand)
          })
        })
      } else {
        repoCommand = 'git checkout -q master; git pull origin master'
        multipleCommands(studentData, studentRepoPath, repoCommand)
      }
    }
  })
})
