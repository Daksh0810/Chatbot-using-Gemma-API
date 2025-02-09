import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Set bot typing animation on
    setIsBotTyping(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: input,
      });

      const botMessage = {
        sender: "bot",
        text: response.data.response,
        isCode: response.data.response.startsWith("```"), // Check if response starts with code block markdown
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to the server." },
      ]);
    }

    // Turn off the bot typing animation after receiving the response
    setIsBotTyping(false);

    setInput("");
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to convert message text into structured HTML
  const formatMessageContent = (content) => {
    // Replace Markdown headers (e.g., # Header) with <h1> tags
    content = content.replace(/^(#{1,6})\s*(.+)$/gm, (match, p1, p2) => {
      const level = p1.length;
      return `<h${level}>${p2}</h${level}>`;
    });
  
    // Replace text between ** with <strong> tags for bold
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
    // Replace newlines with paragraph breaks
    content = content.replace(/\n/g, "<p></p>");
  
    // Return the formatted HTML content
    return content;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#1c1c1c", // Dark background color
        color: "#ffffff", // White text color
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", // Apple system font
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "20px",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          borderRadius: "10px",
          backgroundColor: "#2a2a2a", // Darker background for the chat
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", // Shadow effect for chat container
          margin: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "user" ? "#007bff" : "#444", // User messages with blue, bot messages with dark gray
                color: msg.sender === "user" ? "#fff" : "#ddd", // Light text color for both
                borderRadius: "20px",
                padding: "10px 20px",
                maxWidth: "80%",
                wordWrap: "break-word",
                boxShadow:
                  msg.sender === "user"
                    ? "0px 5px 15px rgba(0, 123, 255, 0.2)"
                    : "none",
              }}
              dangerouslySetInnerHTML={{
                __html: formatMessageContent(msg.text), // Render structured content
              }}
            />
          ))}

          {/* Show typing animation */}
          {isBotTyping && (
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#444",
                color: "#ddd",
                borderRadius: "20px",
                padding: "10px 20px",
                maxWidth: "80%",
                wordWrap: "break-word",
                boxShadow: "none",
                fontStyle: "italic",
              }}
            >
              <div className="typing-indicator">
                <span>Bot is typing</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </div>
            </div>
          )}
        </div>
        {/* Add a reference to the end of the chat for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          display: "flex",
          padding: "10px",
          backgroundColor: "#2a2a2a", // Dark background for input
          borderTop: "1px solid #444",
          position: "sticky",
          bottom: 0,
          boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.5)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}  // Listen for Enter key press
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #444",
            borderRadius: "20px",
            fontSize: "16px",
            marginRight: "10px",
            backgroundColor: "#333", // Dark background for input field
            color: "#fff", // Light text color for input field
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
