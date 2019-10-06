package files

import "time"

type File struct {
	Id             string     `json:"id" bson:"file_id,omitempty"`
	Name           string     `json:"name"`
	Department     string     `json:"department"`
	CurrentVersion string     `json:"current_version_file_id" bson:"current_version_file_id,omitempty"`
	Revisions      []Revision `json:"revisions"`
	CreatedAt      time.Time  `json:"created_at" bson:"created_at,omitempty"`
	LastModified   time.Time  `json:"last_modified" bson:"last_modified,omitempty"`
	Expiry         time.Time  `json:"expiry"`
}
type Revision struct {
	TsRevised time.Time `json:"ts_revised" bson:"ts_revised,omitempty"`
	FileId    string    `json:"file_id" bson:"file_id,omitempty"`
}

func GetNewFileName() string {
	return getNewFileName()
}
func AddNewFile(fileId, name, email, department string, expiry time.Time) error {
	return addNewFile(fileId, name, email, department, expiry)
}
func GetFiles(email string) ([]File, error) {
	return getFiles(email)
}
func GetFilesByDepartment() ([]File, error) {
	return getFilesByDepartment()
}
func ReadFile(id string) ([]byte, error) {
	return readFile(id)
}
func UpdateFile(id, newData string) error {
	return updateFile(id, newData)
}
func DeleteFile(id string) error {
	return deleteFile(id)
}
func PullFileData(fileId string) (string, error) {
	return pullFileData(fileId)
}
