/**
 * @version 0.5.0
 * @author [Grayson Orr](https://github.com/grayson-orr)
 */

const { createDir, fileDirExists } = require('../helper')

/**
 * Testing data
 */
const csvFiles = ['mobile.csv', 'oosd.csv', 'prog-four.csv', 'web-one.csv']

describe('createDir', () => {
  test('should return a csv directory', () => {
    const csvPath = createDir('csv')
    expect(csvPath).toEqual('csv')
  })

  test('should return an error creating a csv directory', () => {
    const csvPath = createDir('//csv')
    expect(csvPath).toEqual(new Error('Error creating directory.'))
  })
})

describe('fileDirExists', () => {
  test('should return a CSV file that exists', () => {
    const csvDoesntExist = fileDirExists(csvFiles, 'prog-four.csv')
    expect(csvDoesntExist).toEqual(true)
  })

  test("should return a CSV file that doesn't exists", () => {
    const csvDoesntExist = fileDirExists(csvFiles, 'prog-three.csv')
    expect(csvDoesntExist).toEqual(false)
  })
})
