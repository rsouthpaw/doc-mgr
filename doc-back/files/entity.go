package files

import (
	"io/ioutil"
	"log"
	"path"
	"time"

	"../base"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func addNewFileEntity(fileId, name, email, department string, expiry time.Time) error {

	session, err := mgo.Dial(base.MONGO_BASE_URL)
	if err != nil {
		log.Println("ERROR:", err)
	}
	defer session.Close()

	c := session.DB(base.DB_ACTYV).C(base.COL_FILES)
	data := bson.M{
		"file_id":                 fileId,
		"current_version_file_id": fileId,
		"name":                    name,
		"email":                   email,
		"created_at":              time.Now(),
		"expiry":                  expiry,
		"department":              department,
		"is_active":               true,
	}
	err = c.Insert(data)
	if err != nil {
		log.Println("ERROR:", err, fileId, name, email)
	}
	return err
}
func getFilesEntity(email string) ([]File, error) {

	session, err := mgo.Dial(base.MONGO_BASE_URL)
	if err != nil {
		log.Println("ERROR:", err)
	}
	defer session.Close()

	c := session.DB(base.DB_ACTYV).C(base.COL_FILES)
	data := bson.M{
		"email": email,
		"expiry": bson.M{
			"$gte": time.Now(),
		},
		"is_active": true,
	}
	var files []File
	err = c.Find(data).All(&files)
	if err != nil {
		log.Println("ERROR:", err, email)
	}
	return files, err

}
func getFilesByDepartmentEntity() ([]File, error) {

	session, err := mgo.Dial(base.MONGO_BASE_URL)
	if err != nil {
		log.Println("ERROR:", err)
	}
	defer session.Close()

	c := session.DB(base.DB_ACTYV).C(base.COL_FILES)
	data := bson.M{
		"department": bson.M{
			"$exists": true,
			"$ne":     "",
		},
		"expiry": bson.M{
			"$gte": time.Now(),
		},
		"is_active": true,
	}
	var files []File
	err = c.Find(data).All(&files)
	if err != nil {
		log.Println("ERROR:", err)
	}
	return files, err
}
func readFileEntity(id string) ([]byte, error) {
	log.Println(path.Join(base.FILE_DIR_BASE_PATH, id+".txt"))
	return ioutil.ReadFile(path.Join(base.FILE_DIR_BASE_PATH, id+".txt"))
}

func updateFileEntity(id, newId, newData string) error {

	session, err := mgo.Dial(base.MONGO_BASE_URL)
	if err != nil {
		log.Println("ERROR:", err)
	}
	defer session.Close()

	c := session.DB(base.DB_ACTYV).C(base.COL_FILES)
	query := bson.M{
		"current_version_file_id": id,
	}
	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"last_modified":           now,
			"current_version_file_id": newId,
		},
		"$push": bson.M{
			"revisions": bson.M{
				"ts_revised": now,
				"file_id":    newId,
			},
		},
	}
	err = c.Update(query, update)
	if err != nil {
		log.Println("ERROR:", err)
	}
	return err
}
func saveNewFileEntity(newId, newData string) error {
	return ioutil.WriteFile(path.Join(base.FILE_DIR_BASE_PATH, newId+".txt"), []byte(newData), 0644)
}
func deleteFileEntity(id string) error {

	session, err := mgo.Dial(base.MONGO_BASE_URL)
	if err != nil {
		log.Println("ERROR:", err)
	}
	defer session.Close()

	c := session.DB(base.DB_ACTYV).C(base.COL_FILES)
	query := bson.M{
		"file_id": id,
	}
	update := bson.M{
		"$set": bson.M{
			"deleted_at": time.Now(),
			"is_active":  false,
		},
	}
	err = c.Update(query, update)
	if err != nil {
		log.Println("ERROR:", err)
	}
	return err
}
