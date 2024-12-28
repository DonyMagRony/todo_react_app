import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun,Edit, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done");
  const taskDeadline = useRef("");

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current,
      deadline: taskDeadline.current.value, 
    };
    setTasks([...tasks, newTask]);
    saveTasks([...tasks, newTask]);
  }

  function deleteTask(index) {
    const clonedTasks = [...tasks];
    clonedTasks.splice(index, 1);
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    if (tasks) setTasks(tasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const sortTasks = (state) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.state === state && b.state !== state) return -1;
      if (a.state !== state && b.state === state) return 1;
      return 0;
    });
    setTasks(sortedTasks);
  };

  const filterTasks = (state) => {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    const filteredTasks = tasks.filter((task) => task.state === state);
    setTasks(filteredTasks);
  };

  const sortByDeadline = () => {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    const sortedByDeadline = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setTasks(sortedByDeadline);
  };

  function editTask(index) {
    setOpened(true)
    deleteTask(index)
  }

  return (
    <ColorSchemeProvider
    colorScheme={colorScheme}
    toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
        >
        <div className="App">
          <Modal
                opened={opened}
                size={"md"}
                title={"New Task"}
                withCloseButton={false}
                onClose={() => {
                  setOpened(false);
                }}
                centered
              >
                <TextInput
                  mt={"md"}
                  ref={taskTitle}
                  placeholder={"Task Title"}
                  required
                  label={"Title"}
                />
                <TextInput
                  ref={taskSummary}
                  mt={"md"}
                  placeholder={"Task Summary"}
                  label={"Summary"}
                />
            <Select
              label="State"
              data={["Done", "Not done", "Doing right now"]}
              onChange={(value) => (taskState.current = value)}
            />
            <input
              type="date"
              ref={taskDeadline}
              placeholder="Pick a date"
              style={{ width: "100%", marginTop: "10px" }}
            />

            <Group position="apart" mt="md">
              <Button onClick={() => setOpened(false)} variant="subtle">Cancel</Button>
              <Button onClick={createTask}>Create Task</Button>
            </Group>
          </Modal>
          
          <Container size={550} my={40}>
            <Group position="apart">
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>

              <ActionIcon color="blue" onClick={() => toggleColorScheme()} size="lg">
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>

            <Group mt="md">
              <Button onClick={() => loadTasks()}>Show all</Button>
              <Button onClick={() => sortTasks("Done")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>Show 'Doing' first</Button>
              <Button onClick={() => sortTasks("Not done")}>Show 'Not done' first</Button>
            </Group>

            <Group mt="md">
              <Button onClick={() => filterTasks("Done")}>Show only 'Done'</Button>
              <Button onClick={() => filterTasks("Not done")}>Show only 'Not done'</Button>
              <Button onClick={() => filterTasks("Doing right now")}>Show only 'Doing'</Button>
            </Group>

            <Button onClick={sortByDeadline} mt="md" fullWidth>
              Sort by deadline
            </Button>

            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card key={index} withBorder mt="sm">
                  <Group position="apart">
                    <Text weight="bold">{task.title}</Text>
                    <Group>
                      <ActionIcon color="yellow" onClick={() => editTask(index)}>
                        <Edit />
                      </ActionIcon>
                      <ActionIcon onClick={() => deleteTask(index)} color="red">
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color="dimmed" size="md" mt="sm">
                    {task.summary ? task.summary : "No summary provided"}
                  </Text>
                  <Text size="sm" color="dimmed" mt="sm">
                    State: {task.state}
                  </Text>
                  <Text size="sm" color="dimmed" mt="sm">
                    Deadline: {task.deadline ? task.deadline : "No deadline set"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size="lg" mt="md" color="dimmed">
                You have no tasks
              </Text>
            )}

            <Button fullWidth mt="md" onClick={() => setOpened(true)}>
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}