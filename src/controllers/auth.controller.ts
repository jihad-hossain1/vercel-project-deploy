import authService from "../service/auth.service";
import { Request, Response } from "express";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, jsonData } = req.body;

      const newUser = await authService.register({ email, jsonData });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const newUser = await authService.verify({ email, code });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const jsonData = req.body;
      const user = await authService.login(jsonData);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await authService.forgotPassword({ email });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async verifyCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const user = await authService.verifyCode({ email, code });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async confirmPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await authService.confirmPassword({ email, password });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async applyForActivation(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await authService.applyForActivation({ email });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async userActivate(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const user = await authService.userActivate({ email });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // async resetPassword(req, res) {
  //   try {
  //     const { email, code, password } = req.body;
  //     const user = await authService.resetPassword({ email, code, password });
  //     res.status(200).json(user);
  //   } catch (error) {
  //     res.status(500).json(error);
  //   }
  // }
}

export default new AuthController();
