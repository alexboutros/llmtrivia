#!/usr/bin/env node
import axios from "axios";
import clipboardy from "clipboardy";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import he from "he";

const pastelPurple = chalk.hex("#cdb4db");
const pastelBlue = chalk.hex("#aec6cf");
const pastelGreen = chalk.hex("#77dd77");
const pastelRed = chalk.hex("#ff6961");
const pastelYellow = chalk.hex("#fdfd96");
const pastelPink = chalk.hex("#ffd1dc");
const pastelTeal = chalk.hex("#b2f9fc");

const allowedCategories = [
  9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 30, 31, 32,
];

function getRandomCategory() {
  const randomIndex = Math.floor(Math.random() * allowedCategories.length);
  return allowedCategories[randomIndex];
}

async function fetchTrivia(
  copyToClipboard = false,
  questionType = null,
  invalidType = false,
  specifiedType = "",
  retryCount = 0
) {
  const spinner = ora({
    text: pastelTeal("Fetching trivia..."),
    spinner: "dots",
  }).start();

  try {
    const category = getRandomCategory();
    let apiUrl = `https://opentdb.com/api.php?amount=1&category=${category}`;
    if (questionType === "multiple" || questionType === "boolean") {
      apiUrl += `&type=${questionType}`;
    }

    if (invalidType) {
      spinner.warn(
        pastelYellow(
          `Incorrect type. Options are "multiple" or "boolean" (true or false). You typed: "${specifiedType}"`
        )
      );
      spinner.start(pastelTeal("Continuing without a specific type filter..."));
    }

    const response = await axios.get(apiUrl);
    spinner.stop();

    const data = response.data;
    if (data.results && data.results.length > 0) {
      const formattedQuestions = data.results.map((questionData) =>
        formatQuestion(questionData)
      );

      formattedQuestions.forEach((formattedQuestion) => {
        let output = "";
        output += pastelTeal("Question:\n");
        output += pastelBlue(`${formattedQuestion.question}\n\n`);

        if (copyToClipboard) {
          output += pastelYellow("(Copying question to clipboard...)\n\n");
          clipboardy.writeSync(formattedQuestion.question);
        }

        output += pastelTeal("Answers:\n");
        formattedQuestion.answers.forEach((answer, i) => {
          if (answer.startsWith("* ")) {
            output += pastelGreen(`  ${i + 1}. ${answer}\n`);
          } else {
            output += pastelRed(`  ${i + 1}. ${answer}\n`);
          }
        });

        console.log(
          boxen(output, {
            padding: 1,
            borderStyle: "round",
            borderColor: "#cdb4db",
            margin: 1,
          })
        );
      });
    } else {
      throw new Error("No trivia questions found.");
    }
  } catch (error) {
    spinner.stop();

    if (error.response && error.response.status === 429) {
      ora().fail(pastelRed(" Rate limit reached!"));
      const waitSpinner = ora({
        text: pastelTeal("Waiting to retry..."),
        spinner: "dots",
      }).start();

      for (let i = 5; i > 0; i--) {
        waitSpinner.text = pastelTeal(`Retrying in ${i} second${i > 1 ? "s" : ""}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      waitSpinner.stop();
      return fetchTrivia(copyToClipboard, questionType, invalidType, specifiedType, retryCount + 1);
    } else {
      console.error(pastelRed(`Error fetching trivia questions: ${error.message}`));
    }
  }
}

function formatQuestion(questionData) {
  const { type, question, correct_answer, incorrect_answers } = questionData;
  let decodedQuestion = he.decode(question);
  if (type === "boolean") {
    decodedQuestion += " True or false?";
  }
  const answers = [...incorrect_answers, `* ${correct_answer}`].map((ans) =>
    he.decode(ans)
  );
  const shuffledAnswers = shuffleArray(answers);
  return {
    question: decodedQuestion,
    answers: shuffledAnswers,
  };
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

const args = process.argv.slice(2);
const copyToClipboard = args.includes("-c");
const typeArg = args.find((arg) => arg.startsWith("-type="));
let questionType = null;
let invalidType = false;
let specifiedType = "";

if (typeArg) {
  const [, parsedType] = typeArg.split("=");
  specifiedType = parsedType;
  if (parsedType === "multiple" || parsedType === "boolean") {
    questionType = parsedType;
  } else {
    invalidType = true;
  }
}

fetchTrivia(copyToClipboard, questionType, invalidType, specifiedType);

export { fetchTrivia };
