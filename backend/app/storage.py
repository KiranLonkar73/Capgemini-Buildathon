from __future__ import annotations

import json
from pathlib import Path
import os
import tempfile

from .models import CompanySettings, PolicyReference


class JsonStateStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def load_references(self) -> list[PolicyReference] | None:
        state = self._read()
        references = state.get("policy_references")
        if not references:
            return None
        return [PolicyReference.model_validate(reference) for reference in references]

    def save_references(self, references: list[PolicyReference]) -> None:
        state = self._read()
        state["policy_references"] = [reference.model_dump() for reference in references]
        self._write(state)

    def load_settings(self) -> CompanySettings:
        state = self._read()
        if not state.get("settings"):
            return CompanySettings()
        return CompanySettings.model_validate(state["settings"])

    def save_settings(self, settings: CompanySettings) -> None:
        state = self._read()
        state["settings"] = settings.model_dump()
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
