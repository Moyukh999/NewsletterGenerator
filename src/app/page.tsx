"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { CopilotTextarea } from "@copilotkit/react-textarea";
import "@copilotkit/react-textarea/styles.css";

const NewsletterForm = () => {
  const [template, setTemplate] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [emailPreview, setEmailPreview] = useState<string>(""); // New state for email preview
  const router = useRouter();

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          setCsvData(result.data);
          console.log(result.data);
        },
      });
    }
  };

  const handleSubmit = async () => {
    setIsSending(true);
    const emailData = {
      template,
      subject,
      content,
      recipients: csvData,
    };

    try {
      const response = await fetch("/api/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
      // Handle response if necessary
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending emails");
    } finally {
      setIsSending(false);
    }
  };

  // New function to generate email preview
  const handlePreview = () => {
    setEmailPreview(`Subject: ${subject}\n\n${content}`);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        backgroundImage: "url('https://www.template.net/wp-content/uploads/2022/12/Newspaper-Texture-Background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Title in a box for better visibility */}
      <motion.div
        className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg mb-12 w-full max-w-md border border-black"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.h1
          className="text-4xl font-extrabold text-gray-800 font-newspaper-heading"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            whiteSpace: "nowrap",
          }}
        >
          Newsletter Generator
        </motion.h1>
      </motion.div>

      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
          borderRadius: "15px",
          border: "1px solid black", // Add a black border
        }}
      >
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 font-newspaper-heading">
            Choose a Template
          </label>
          <motion.select
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
            value={template ?? ""}
            onChange={(e) => setTemplate(e.target.value)}
            whileFocus={{ scale: 1.05 }}
          >
            <option value="" disabled>
              Select Template
            </option>
            <option value="template1.html">Template 1</option>
            <option value="template2.html">Template 2</option>
            <option value="template3.html">Template 3</option>
          </motion.select>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 font-newspaper-heading">
            Subject
          </label>
          <motion.input
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            whileFocus={{ scale: 1.05 }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 font-newspaper-heading">
            Content
          </label>
          <CopilotTextarea
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
            value={content}
            onValueChange={(value: string) => setContent(value)} // Update state when content changes
            placeholder="Enter the email body content here..."
            autosuggestionsConfig={{
              textareaPurpose: "the body of an email message",
              chatApiConfigs: {
                suggestionsApiConfig: {
                  maxTokens: 20,
                  stop: [".", "?", "!"],
                },
              },
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 font-newspaper-heading">
            Upload CSV (Name, Email)
          </label>
          <motion.input
            className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            whileFocus={{ scale: 1.05 }}
          />
        </div>

        {/* Button to preview email */}
        <motion.button
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg shadow-md w-full font-semibold tracking-wide mt-6"
          onClick={handlePreview}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Preview Email
        </motion.button>

        {/* Preview Email Section */}
        {emailPreview && (
          <div className="mt-6 p-4 border border-black rounded-lg bg-gray-50 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-800">Email Preview</h2>
            <pre className="text-gray-600 whitespace-pre-wrap">{emailPreview}</pre> {/* Ensure text wraps within the box */}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#6366f1" }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 text-white py-3 px-6 rounded-lg shadow-md w-full font-semibold tracking-wide mt-6"
          onClick={handleSubmit}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8.25v7.5M3 8.25l7.5-4.5m0 12l7.5-4.5m-7.5 4.5v-12m7.5 12v-7.5m0 7.5l7.5-4.5M7.5 8.25v12m0-12L3 3.75"
            />
          </svg>
          Submit
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default NewsletterForm;
