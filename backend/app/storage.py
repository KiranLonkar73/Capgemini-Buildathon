from __future__ import annotations

import json
from pathlib import Path
import os
import tempfile

from .models import AuditEvent, CompanySettings, Employee, PolicyReference, SavedSession


class JsonStateStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def load_references(self) -> list[PolicyReference] | None:
        state = self._read()
        references = state.get("policy_references")
        if not references:
            return None
        parsed: list[PolicyReference] = []
        for reference in references:
            try:
                parsed.append(PolicyReference.model_validate(reference))
            except Exception:
                continue
        return parsed or None

    def save_references(self, references: list[PolicyReference]) -> None:
        state = self._read()
        state["policy_references"] = [reference.model_dump() for reference in references]
        self._write(state)

    def load_settings(self) -> CompanySettings:
        state = self._read()
        raw = state.get("settings")
        if not raw:
            return CompanySettings()
        try:
            return CompanySettings.model_validate(raw)
        except Exception:
            return CompanySettings()

    def save_settings(self, settings: CompanySettings) -> None:
        state = self._read()
        state["settings"] = settings.model_dump()
        self._write(state)

    def load_employees(self) -> list[Employee]:
        employees: list[Employee] = []
        for item in self._read().get("employees", []):
            try:
                employees.append(Employee.model_validate(item))
            except Exception:
                continue
        return employees

    def save_employees(self, employees: list[Employee]) -> None:
        state = self._read()
        state["employees"] = [employee.model_dump() for employee in employees]
        self._write(state)

    def load_sessions(self) -> list[SavedSession]:
        sessions: list[SavedSession] = []
        for item in self._read().get("sessions", []):
            try:
                sessions.append(SavedSession.model_validate(item))
            except Exception:
                continue
        return sessions

    def save_sessions(self, sessions: list[SavedSession]) -> None:
        state = self._read()
        state["sessions"] = [session.model_dump() for session in sessions]
        self._write(state)

    def load_audit_events(self) -> list[AuditEvent]:
        events: list[AuditEvent] = []
        for item in self._read().get("audit_events", []):
            try:
                events.append(AuditEvent.model_validate(item))
            except Exception:
                continue
        return events

    def save_audit_events(self, events: list[AuditEvent]) -> None:
        state = self._read()
        state["audit_events"] = [event.model_dump() for event in events]
        self._write(state)

    def _read(self) -> dict:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

    def _write(self, state: dict) -> None:
        # Write atomically: write to a temp file in the same directory, then replace
        self.path.parent.mkdir(parents=True, exist_ok=True)
        dirpath = str(self.path.parent)
        fd = None
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile("w", delete=False, dir=dirpath, encoding="utf-8") as handle:
                json.dump(state, handle, indent=2, ensure_ascii=False)
                handle.flush()
                tmp_path = Path(handle.name)
            os.replace(str(tmp_path), str(self.path))
        finally:
            # Best-effort cleanup if something went wrong
            try:
                if tmp_path and tmp_path.exists():
                    tmp_path.unlink()
            except Exception:
                pass
