import React, { useState } from "react";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import styles from "../styles/Eliza.module.css";
import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";
import { ElizaService } from "../gen/buf/connect/demo/eliza/v1/eliza_connect.js";
import {
  IntroduceRequest,
  SayRequest,
} from "../gen/buf/connect/demo/eliza/v1/eliza_pb.js";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let props = {};
  const client = createPromiseClient(
    ElizaService,
    createConnectTransport({
      baseUrl: "http://0.0.0.0:3000/api",
    })
  );

  const request = new SayRequest({
    sentence: "hello",
  });

  const result = await client.say(request);

  console.log(result);
  return { props };
};

interface Response {
  text: string;
  sender: "eliza" | "user";
}

function App() {
  const [statement, setStatement] = useState<string>("");
  const [introFinished, setIntroFinished] = useState<boolean>(false);
  const [responses, setResponses] = useState<Response[]>([
    {
      text: "What is your name?",
      sender: "eliza",
    },
  ]);

  // Make the Eliza Service client
  const client = createPromiseClient(
    ElizaService,
    createConnectTransport({
      baseUrl: "/api",
    })
  );

  const send = async (sentence: string) => {
    setResponses((resp) => [...resp, { text: sentence, sender: "user" }]);
    setStatement("");

    if (introFinished) {
      const response = await client.say({
        sentence,
      });

      setResponses((resp) => [
        ...resp,
        { text: response.sentence, sender: "eliza" },
      ]);
    } else {
      const request = new IntroduceRequest({
        name: sentence,
      });

      for await (const response of client.introduce(request)) {
        setResponses((resp) => [
          ...resp,
          { text: response.sentence, sender: "eliza" },
        ]);
      }

      setIntroFinished(true);
    }
  };

  const handleStatementChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStatement(event.target.value);
  };

  const handleSend = () => {
    send(statement);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div>
      <header className={styles.appHeader}>
        <h1 className={styles.headline}>Eliza</h1>
        <h4 className={styles.subtitle}>Next.js</h4>
      </header>
      <div className={styles.container}>
        {responses.map((resp, i) => {
          return (
            <div
              key={`resp${i}`}
              className={
                resp.sender === "eliza"
                  ? styles.elizaRespContainer
                  : styles.userRespContainer
              }
            >
              <p className={styles.respText}>{resp.text}</p>
            </div>
          );
        })}
        <div>
          <input
            type="text"
            className={`${styles.textInput} ${styles.statementInput}`}
            value={statement}
            onChange={handleStatementChange}
            onKeyPress={handleKeyPress}
          />
          <button className={styles.button} onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
