import React, { Component } from "react";
import "../../style/Compiler.css";

import API from "../Api";

export default class Compiler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: localStorage.getItem("input") || ``,
      output: ``,
      language_id: localStorage.getItem("language_Id") || 2,
      user_input: ``,
    };
  }

  // Save code input to state and localStorage
  input = (event) => {
    event.preventDefault();
    this.setState({ input: event.target.value });
    localStorage.setItem("input", event.target.value);
  };

  // Save user input for code execution
  userInput = (event) => {
    event.preventDefault();
    this.setState({ user_input: event.target.value });
  };

  // Set language ID and save to localStorage
  language = (event) => {
    event.preventDefault();
    this.setState({ language_id: event.target.value });
    localStorage.setItem("language_Id", event.target.value);
  };

  // Main function to create a submission and poll for results
  submit = async (e) => {
    e.preventDefault();
    // Reset output before starting a new submission
    this.setState({ output: "Creating Submission...\n" });

    try {
      // Create a submission with base64 encoding and without waiting for results
      const submissionResponse = await API.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
        {
          source_code: this.state.input,
          stdin: this.state.user_input,
          language_id: this.state.language_id,
        },
        {
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key":
              "e15732b88amsh5da955e4d55a72bp1f8478jsn8a216880b248",
            "content-type": "application/json",
            accept: "application/json",
          },
        }
      );

      // Inform the user that the submission was created and that the status is being checked
      this.setState((prevState) => ({
        output:
          prevState.output +
          "Submission Created...\nChecking Submission Status...\n",
      }));

      // Retrieve the submission token from the response
      const token = submissionResponse.data.token;
      // Poll the API for the submission result
      const submissionResult = await this.checkSubmissionStatus(token);

      // Check and decode results
      if (submissionResult.stdout) {
        const decodedOutput = atob(submissionResult.stdout);
        this.setState({
          output: `Results:\n${decodedOutput}\nExecution Time: ${submissionResult.time} Secs\nMemory Used: ${submissionResult.memory} bytes`,
        });
      } else if (submissionResult.stderr) {
        this.setState({
          output: `Error:\n${atob(submissionResult.stderr)}`,
        });
      } else if (submissionResult.compile_output) {
        this.setState({
          output: `Compilation Error:\n${atob(submissionResult.compile_output)}`,
        });
      }
    } catch (error) {
      console.error("Error during submission:", error);
      this.setState({
        output: "An error occurred during code submission. Please try again.",
      });
    }
  };

  // Polling function to check submission status until it is processed
  checkSubmissionStatus = async (token) => {
    const statusUrl = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`;
    let submissionData = null;
    let statusDescription = "Queue";

    // Continue polling while the submission is still being processed
    while (statusDescription === "Queue" || statusDescription === "Processing") {
      const response = await API.get(statusUrl, {
        headers: {
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key":
            "e15732b88amsh5da955e4d55a72bp1f8478jsn8a216880b248",
          "content-type": "application/json",
          accept: "application/json",
        },
      });

      submissionData = response.data;
      statusDescription = submissionData.status.description;

      // Break out if we get a final status or if there’s an error
      if (
        statusDescription === "Accepted" ||
        submissionData.stderr ||
        submissionData.compile_output
      ) {
        break;
      }

      // Wait for 2 seconds before polling again to avoid excessive requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return submissionData;
  };

  render() {
    return (
      <>
        <div className="row container-fluid">
          <div className="col-6 ml-4">
            <label htmlFor="solution">
              <span className="badge badge-info heading mt-2">
                <i className="fas fa-code fa-fw fa-lg"></i> Code Here
              </span>
            </label>
            <textarea
              required
              name="solution"
              id="source"
              onChange={this.input}
              className="source"
              value={this.state.input}
            ></textarea>
            <button
              type="submit"
              className="btn btn-danger ml-2 mr-2"
              onClick={this.submit}
            >
              <i className="fas fa-cog fa-fw"></i> Run
            </button>
            <label htmlFor="tags" className="mr-1">
              <b className="heading">Language:</b>
            </label>
            <select
              value={this.state.language_id}
              onChange={this.language}
              id="tags"
              className="form-control form-inline mb-2 language"
            >
              <option value="54">C++</option>
              <option value="50">C</option>
              <option value="62">Java</option>
              <option value="71">Python</option>
              <option value="102">JavaScript</option>
            </select>
          </div>
          <div className="col-5">
            <div>
              <span className="badge badge-info heading my-2">
                <i className="fas fa-exclamation fa-fw fa-md"></i> Output
              </span>
              {/* Using a controlled textarea to display the output */}
              <textarea id="output" value={this.state.output} readOnly></textarea>
            </div>
          </div>
        </div>
        <div className="mt-2 ml-5">
          <span className="badge badge-primary heading my-2">
            <i className="fas fa-user fa-fw fa-md"></i> User Input
          </span>
          <br />
          <textarea id="input" onChange={this.userInput}></textarea>
        </div>
      </>
    );
  }
}
