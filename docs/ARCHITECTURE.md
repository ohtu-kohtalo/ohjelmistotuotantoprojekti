# Dependency chart

## Frontend

> [!NOTE]
> All frontend components import React, this is not explicitly mentioned in the graph

```mermaid
graph TD
    App[App.jsx] -->|uses| Title[Title.jsx]
    App -->|uses| QueryForm[QueryForm.jsx]
    App -->|uses| ChatContainer[ChatContainer.jsx]
    App -->|uses| ErrorMessage[ErrorMessage.jsx]
    App -->|uses| LoadingIndicator[LoadingIndicator.jsx]
    ChatContainer -->|uses| ChatMessage[ChatMessage.jsx]
    ChatMessage -->|uses| MarkdownRenderer[MarkdownRenderer.jsx]
    main[main.jsx] -->|renders| App

    subgraph Third-Party Libraries
        ReactMarkdown[ReactMarkdown]
    end

    MarkdownRenderer -->|imports| ReactMarkdown

```

## Backend

```mermaid
graph LR
    app[app.py] -->|imports| generator[generator.py]
    generator -->|imports| gemini[gemini.py]
    gemini -->|imports| gemini_config[gemini_config.py]
    gemini_config -->|imports| key_config[key_config.py]

    subgraph Standard Library
        os[os]
    end

    subgraph Third-Party Libraries
        flask[Flask]
        flask_cors[CORS]
        pandas[pandas]
        python-dotenv[dotenv]
        google.generativeai[genai]
    end

    app -->|imports| flask
    app -->|imports| flask_cors
    generator -->|imports| os
    generator -->|imports| pandas
    generator -->|imports| key_config
    gemini_config -->|imports| google.generativeai
    key_config -->|imports| os
    key_config -->|imports| python-dotenv
```
