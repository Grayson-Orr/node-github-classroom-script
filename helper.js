/**
 * @version 0.5.0
 * @author [Grayson Orr](https://github.com/grayson-orr)
 */

const { existsSync, mkdirSync } = require('fs')

/**
 * @param {string} myPath
 */
const createDir = myPath => {
  try {
    if (!existsSync(myPath)) mkdirSync(myPath)
  } catch (err) {
    return new Error('Error creating directory.')
  }
  return myPath
}

/**
 * @param {object} myCourseFile
 * @param {string} myOtherFile
 */
const fileDirExists = (myCourseFile, myOtherFile) => {
  return myCourseFile.indexOf(myOtherFile) > -1 ? true : false
}

module.exports = {
  createDir,
  fileDirExists
}
