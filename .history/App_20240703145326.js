import { useMemo, useState, useEffect, useCallback } from "react";
import { Button, ButtonText, Text, SafeAreaView } from "react-native";
import * as SQLite from "expo-sqlite/next";

const App = () => {
  const [error, setError] = useState();
  const [data, setData] = useState();

  const db = useMemo(() => SQLite.openDatabaseSync("storage"), []);

  /**
   * I also tried these two versions
   *
   *  CREATE TABLE IF NOT EXISTS Example (id INTEGER PRIMARY KEY NOT NULL, data BLOB NOT NULL);
   *
   *  CREATE TABLE IF NOT EXISTS Example (id INTEGER PRIMARY KEY NOT NULL, data JSON NOT NULL);
   */

  const createTables = useCallback(async () => {
    try {
      await db.execAsync("PRAGMA journal_mode = WAL");
      await db.execAsync("PRAGMA foreign_keys = ON");
      await db.execAsync("DROP TABLE IF EXISTS Example");
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Example (
          id INTEGER PRIMARY KEY NOT NULL,
          data JSON NOT NULL
        );`);
    } catch (e) {
      console.log("failed to create tables", e);
      setError("ERROR CREATING DATABASE");
    }
  }, [db]);

  useEffect(() => {
    createTables();
  }, [createTables]);

  const insertData = async () => {
    try {
      // const minified = "test"; // Works
      // These two strings don't work
      // I'm trying to save a large json object that contains some of these characters and others
      const minified = "°F, Ω, ÷, ×, x";
      // const minified = JSON.stringify({
      //   test: "°F, Ω, ÷, ×, x"
      // });

      await db.runAsync(
        `INSERT INTO Example (data) VALUES ('${minified}')`
        // `INSERT INTO Example (data) VALUES (json_encode('${minified}'))`
      );

      const res = await db.getFirstAsync("SELECT * FROM Example");

      if (res?.data) setData(res.data);
      setError(undefined);
    } catch (e) {
      console.log(e);
      setError(`ERROR INSERTING DATA ${e.toString()}`);
    }
  };

  return (
    <SafeAreaView>
      <Button onPress={() => insertData()}>
        <ButtonText>INSERT DATA</ButtonText>
      </Button>
      {data && <Text>{data}</Text>}
      {error && <Text>{error}</Text>}
    </SafeAreaView>
  );
};

export default App;
