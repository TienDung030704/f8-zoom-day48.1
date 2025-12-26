import { useEffect } from "react";
import { useState } from "react";

function App() {
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAddTodo = async (e) => {
    e.preventDefault(); // Ngăn trang reload khi submit form
    try {
      const result = await fetch("http://127.0.0.1:3000/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: inputValue }),
      });
      await result.json();
    } catch (error) {
      console.error("Lỗi gọi API:", error.message);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:3000/api/tasks")
      .then((res) => res.json())
      .then((result) => {
        setList(result.data);
        setLoading(false);
      });
  }, []);
  return (
    <div>
      <div>
        <ul>
          {list.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
        <h1 className="text-2xl font-bold mb-4">Todo List</h1>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-1"
            placeholder="Vui lòng nhập thông tin cần thêm"
            type="text"
          />
          <button
            onClick={handleAddTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
