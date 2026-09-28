"use client";
import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions";
import { Button } from "./ui/button";
export function AccountForm({ name, email }: { name: string; email: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="form-grid panel"
      style={{ maxWidth: 540 }}
      action={(data) =>
        start(async () => {
          try {
            const r = await updateProfile(data);
            setMessage(r.error ?? "บันทึกชื่อเรียบร้อยแล้ว");
          } catch {
            setMessage("บันทึกไม่สำเร็จ");
          }
        })
      }
    >
      <label>
        ชื่อที่แสดง
        <input name="full_name" defaultValue={name} required maxLength={100} />
      </label>
      <label>
        อีเมล
        <input value={email} readOnly />
      </label>
      <Button disabled={pending}>บันทึกข้อมูล</Button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
