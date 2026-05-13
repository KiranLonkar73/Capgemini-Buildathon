from __future__ import annotations

from pathlib import Path

from .analyzer import analyze_text
from .models import AnalyzeRequest, CompanySettings, ComplianceReport, PolicyReference
from .policy_store import PolicyStore
from .storage import JsonStateStore


class ComplianceService:
    def __init__(self, data_path: Path) -> None:
        self.storage = JsonStateStore(data_path)
        self.policy_store = PolicyStore()
        saved_references = self.storage.load_references()
        if saved_references:
            self.policy_store.load_references(saved_references)
        else:
            self.policy_store.load_seed_policies()
            self.storage.save_references(self.policy_store.references)
        self.settings = self.storage.load_settings()

    @property
    def policy_chunk_count(self) -> int:
        return self.policy_store.chunk_count

    def update_settings(self, settings: CompanySettings) -> CompanySettings:
        self.settings = settings
        self.storage.save_settings(settings)
        return settings

    def upload_policy(self, text: str, policy_name: str, section: str, owner: str) -> list[PolicyReference]:
        references = self.policy_store.add_policy_text(text=text, policy=policy_name, section=section, owner=owner)
        self.storage.save_references(self.policy_store.references)
        return references

    def analyze(self, payload: AnalyzeRequest) -> ComplianceReport:
        threshold = payload.threshold if payload.threshold is not None else self.settings.threshold
        return analyze_text(payload.text, self.policy_store, threshold)
