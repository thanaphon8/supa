"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Todo {
  id: number;
  task_name: string;
  status: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. ฟังก์ชันดึงข้อมูลทั้งหมด
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.error("Error fetching:", error.message);
    else setTodos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 2. ฟังก์ชันเพิ่มรายการใหม่
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ task_name: newTask, status: false }]);

    if (error) console.error("Error adding:", error.message);
    else {
      setNewTask("");
      fetchTodos(); // ดึงข้อมูลใหม่
    }
  };

  // 3. ฟังก์ชันสลับสถานะ (Completed / Pending)
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ status: !currentStatus })
      .eq("id", id);

    if (error) console.error("Error updating:", error.message);
    else fetchTodos();
  };

  // 4. ฟังก์ชันลบรายการ
  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) console.error("Error deleting:", error.message);
    else fetchTodos();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-8">My Todo List (Supabase + Next.js)</h1>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-800">
        {/* ฟอร์มเพิ่มข้อมูล */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="เพิ่มรายการใหม่..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            เพิ่ม
          </button>
        </form>

        {/* รายการข้อมูล */}
        {loading ? (
          <p className="text-center text-zinc-500 py-4">กำลังโหลด...</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {todos.length > 0 ? (
              todos.map((todo) => (
                <li key={todo.id} className="py-3 flex justify-between items-center gap-2">
                  <span
                    onClick={() => toggleTodo(todo.id, todo.status)}
                    className={`cursor-pointer flex-1 ${
                      todo.status ? "line-through text-zinc-500" : ""
                    }`}
                  >
                    {todo.task_name}
                  </span>
                  
                  <button
                    onClick={() => toggleTodo(todo.id, todo.status)}
                    className={`text-xs px-2.5 py-1 rounded transition ${
                      todo.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                  >
                    {todo.status ? "Completed" : "Pending"}
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    ลบ
                  </button>
                </li>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-4">ยังไม่มีข้อมูลในตาราง todos</p>
            )}
          </ul>
        )}
      </div>
    </main>
  );
}