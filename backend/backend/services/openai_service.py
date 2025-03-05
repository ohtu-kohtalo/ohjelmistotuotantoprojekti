import asyncio
import threading

from openai import OpenAI as GritOpenAI, AsyncOpenAI as GritAsyncOpenAI

from ..key_config import OPENAI_API_KEY

client = GritOpenAI(api_key=OPENAI_API_KEY)
aclient = GritAsyncOpenAI(api_key=OPENAI_API_KEY)


class OpenAI:
    def __init__(self, openai_api_key=None, model="gpt-4o"):
        self.openai_api_key = openai_api_key or OPENAI_API_KEY
        self.model = model

        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self._start_event_loop, daemon=True)
        self.thread.start()

    def _start_event_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def get_response(self, prompt):
        try:
            completion = client.chat.completions.create(
                model=self.model, message=[{"role": "user", "content": prompt}]
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"OpenAI Error: {e}"

    def get_parallel_responses(self, prompts):
        try:
            future = asyncio.run_coroutine_threadsafe(
                self._create_responses(prompts), self.loop
            )

            results = future.result()

            return self._format_response(results)
        except Exception as e:
            return f"OpenAI Error: {e}"

    async def _create_responses(self, prompts):
        tasks = [self._generate_answer(prompt) for prompt in prompts]
        results = await asyncio.gather(*tasks)
        return results

    async def _generate_answer(self, prompt):
        completion = await aclient.chat.completions.create(
            model=self.model, messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content

    def _format_response(self, responses):
        text = ""
        for response in responses:
            text += "## Answer\n\n"
            text += response.strip() + "\n"
        return text
