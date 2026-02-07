---
name: git-commit-style
description: Guide for naming git commits using emojis to categorize changes. Use this skill when the user asks to generate commit messages or wants a reference for commit emojis.
---

# Git Commit Style with Emojis

This skill defines a standard for using emojis in git commit messages to categorize changes.

## Format
`<emoji> <type>(<scope>): <subject>`

Example: `✨ feat(auth): add login functionality`

## Emoji Guide

| Emoji | Commit Type | Description |
| :--- | :--- | :--- |
| ✨ | feat | New feature |
| 🐛 | fix | Bug fix |
| 📚 | docs | Documentation changes |
| 🎨 | style | Changes that do not affect the meaning of the code (white-space, formatting, etc.) |
| ♻️ | refactor | A code change that neither fixes a bug nor adds a feature |
| ⚡️ | perf | A code change that improves performance |
| 🧪 | test | Adding missing tests or correcting existing tests |
| 🏗️ | build | Changes that affect the build system or external dependencies |
| 👷 | ci | Changes to our CI configuration files and scripts |
| 🧹 | chore | Other changes that don't modify src or test files |
| ⏪️ | revert | Reverts a previous commit |
| 🔀 | merge | Merge branch |
| 🚧 | wip | Work in progress |
| 🔒️ | security | Fix security issues |
| ⬆️ | dep-up | Upgrade dependencies |
| ⬇️ | dep-down | Downgrade dependencies |
| 📌 | pin | Pin dependencies to specific versions |
| 🚑️ | hotfix | Critical hotfix |
| 🌐 | i18n | Internationalization and localization |
| ♿️ | a11y | Accessibility improvements |
| 💥 | breaking | Breaking changes |

## Usage
When generating commit messages, choose the emoji that best represents the primary change in the commit.
