package files

import (
	"log"
	"time"
)

const (
	file_name_timestamp_format = "212006-150405"
)

func getNewFileName() string {
	return time.Now().Format(file_name_timestamp_format)
}
func addNewFile(fileId, name, userId, department string, expiry time.Time) error {
	return addNewFileEntity(fileId, name, userId, department, expiry)
}
func getFiles(email string) ([]File, error) {
	return getFilesEntity(email)
}
func getFilesByDepartment() ([]File, error) {
	return getFilesByDepartmentEntity()
}
func readFile(id string) ([]byte, error) {
	return readFileEntity(id)
}
func updateFile(id, newData string) error {
	newId, err := saveNewFile(newData)
	if err != nil {
		log.Println("ERROR:", err)
		return err
	}
	return updateFileEntity(id, newId, newData)
}
func saveNewFile(newData string) (string, error) {
	newId := getNewFileName()
	return newId, saveNewFileEntity(newId, newData)
}
func deleteFile(id string) error {
	return deleteFileEntity(id)
}
func pullFileData(fileId string) (string, error) {
	data, err := readFile(fileId)
	if err != nil {
		log.Println("ERROR:", err)
	}
	return string(data), err
}
