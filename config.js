require("dotenv").config()

const { DB_USER, 
        DB_NAME,
        DB_PASSWORD, 
        DB_CONNECTION} = process.env

module.exports = {
    [DB_CONNECTION] : {
        database : {
            db_url : `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.fwn15.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
            mongoose_config : {
                useNewUrlParser: true, 
                useUnifiedTopology: true
            }
        }
    }
}